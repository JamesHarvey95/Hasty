import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import DefaultLayout from './layouts/Default';
import HorizontalLayout from './layouts/horizontal/';
import myGa from './pages/googleanalytics/myGa';
import swal from 'sweetalert2';
import { authProtectedFlattenRoutes, publicProtectedFlattenRoutes } from './routes';
import * as userService from '../src/services/userService';
import subscriptionService from './services/subscriptionService';
import 'toastr/build/toastr.css';
import 'rc-pagination/assets/index.css';
import logger from 'sabio-debug';

const DEFAULT_USER = {
  id: 0,
  roles: [],
  email: '',
  isLoggedIn: false,
  hasPlan: false,
};
const defaultHandlers = { response: [], err: [] };
const loading = () => <div className="">loading....</div>;
const _logger = logger.extend('App');
_logger('publicProtectedFlattenRoutes', publicProtectedFlattenRoutes);
_logger('authProtectedFlattenRoutes', authProtectedFlattenRoutes);

export default function App(props) {
  const { pathname, state } = useLocation();
  const [handlers, setHandlers] = useState(defaultHandlers);
  let [currentUser, setCurrentUser] = useState(() => {
    return DEFAULT_USER;
  });
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(DEFAULT_USER);
    if (state?.type === 'USER_VIEW' && state?.payload) {
      setCurrentUser((prevState) => {
        return {
          ...prevState,
          ...state.payload,
          isLoggedIn: true,
        };
      });
    }
  }, [state]);

  useEffect(() => {
    myGa();
  });

  useEffect(() => {
    subscriptionService.getCurrentPlan().then(onGetPlanSuccess).catch(errHandler);
  }, []);

  const onGetPlanSuccess = () => {
    setCurrentUser((prevState) => {
      const user = { ...prevState };
      user.hasPlan = true;
      return user;
    });
  };

  useEffect(() => {
    userService.getCurrentUser().then(onCurrentSuccess).catch(onCurrentError);
  }, [state]);

  const onCurrentSuccess = () => {
    userService.getUserDetails().then(onUserDetailSuccess).catch(onUserDetailError);
  };
  const onCurrentError = (error) => {
    _logger(error);
  };
  const onUserDetailSuccess = (response) => {
    const payload = response.item;
    const roles = payload.roles.map((role) => {
      return role.name;
    });
    setCurrentUser((prevState) => {
      return {
        ...prevState,
        ...payload,
        isLoggedIn: true,
        roles,
      };
    });
  };
  const onUserDetailError = (error) => {
    _logger(error);
  };

  const onLogout = () => {
    userService.logout().then(onLogoutSuccess).catch(onLogoutError);
  };

  const onLogoutSuccess = () => {
    _logger(DEFAULT_USER, '******************');
    setCurrentUser(() => {
      return { DEFAULT_USER };
    });
    swal
      .fire('Yippie!', 'Logout Successful!', 'success', {
        button: 'Ok',
      })
      .then(navigate('/login'));
  };

  const onLogoutError = () => {
    swal.fire('Error', 'Registration Failed.', 'error');
  };

  const [currentPath, setCurrentPath] = useState({
    isPublic: false,
    isSecured: false,
    isUnknown: false,
  });

  const getRouteMapper = useCallback(
    (user) => (routeData) =>
      (
        <Route
          key={routeData.path}
          path={routeData.path}
          exact={routeData.exact}
          name={routeData.name}
          element={<routeData.element currentUser={user} onLogout={onLogout} />}
        />
      ),
    []
  );

  const getMappedRoutes = useCallback(
    (arrOfRouteData, user) => {
      let theseRoutes = arrOfRouteData.map(getRouteMapper(user));
      _logger('getMappedRoutes.', theseRoutes);
      return theseRoutes;
    },
    [getRouteMapper]
  );

  const currentPathCheck = (pp) => {
    let ppPath = pp.path.split('/').filter((el) => el !== '');
    let pathNameCheck = pathname.split('/').filter((el) => el !== '');
    let result = false;
    if (ppPath.length === pathNameCheck.length) {
      if (pathNameCheck.length === 0) {
        result = true;
      } else {
        for (let a = 0; a < pathNameCheck.length; a++) {
          if (pathNameCheck[a] !== ppPath[a]) {
            if (ppPath[a].startsWith(':') && pathNameCheck[a].match(/^[0-9]+$/)) {
              result = true;
            } else {
              return false;
            }
          } else {
            result = true;
          }
        }
      }
    }

    return result;
  };

  // ensure that currentPath.path is set to true, but only if it is false AND it should be true
  useEffect(() => {
    if (publicProtectedFlattenRoutes.some((pp) => currentPathCheck(pp))) {
      if (!currentPath.isPublic) {
        setCurrentPath(() => {
          return { isSecured: false, isPublic: true };
        });
      }
    } else if (authProtectedFlattenRoutes.some((pp) => currentPathCheck(pp))) {
      if (!currentPath.isSecured) {
        setCurrentPath(() => {
          return { isPublic: false, isSecured: true };
        });
      }
    } else if (!currentPath.isUnknown) {
      setCurrentPath(() => {
        return { isUnknown: true };
      });
    }
  }, [pathname, currentPath]);

  const generateDynamicRoutes = (currentUser) => {
    _logger('generateDynamicRoutes', authProtectedFlattenRoutes);
    let routes = authProtectedFlattenRoutes.filter((route) => {
      //all any loggedIn user to see routes that have empty roles
      if (route.roles?.length === 0) {
        return true;
      }
      return route.roles?.some((role) => currentUser.roles.includes(role));
    });
    _logger('generateDynamicRoutes', routes);

    return getMappedRoutes(routes, currentUser);
  };

  const getLast = (arr) => {
    return [arr[arr.length - 1]];
  };

  const errHandler = (error) => {
    if (handlers.err.length > 5) {
      handlers.err.pop();
    }
    setHandlers((prevState) => {
      const err = { ...prevState };
      err.err.push(error);
      return err;
    });
  };

  _logger('render', { pathname, currentUser, currentPath: JSON.stringify(currentPath) });
  return (
    <div>
      <Suspense fallback={loading}>
        {/* if the path is public we do not care about the current User  */}
        {currentPath.isPublic && (
          <DefaultLayout {...props} currentUser={currentUser} onLogout={onLogout}>
            <Routes>{getMappedRoutes(publicProtectedFlattenRoutes, currentUser)}</Routes>
          </DefaultLayout>
        )}

        {/* if the user is logged in and attempting to go to an KNOWN page, that is is also secure/not public  */}
        {currentUser.isLoggedIn && !currentPath.isPublic && !currentPath.isUnknown && (
          <HorizontalLayout {...props} currentUser={currentUser} onLogout={onLogout}>
            <Routes>{generateDynamicRoutes(currentUser)}</Routes>
          </HorizontalLayout>
        )}

        {/* we do not know this url , and so the user status does not matter */}
        {currentPath.isUnknown && (
          <DefaultLayout {...props} currentUser={currentUser} test="brijeshislame">
            <Routes>{getMappedRoutes(getLast(publicProtectedFlattenRoutes), currentUser)}</Routes>
          </DefaultLayout>
        )}
      </Suspense>
    </div>
  );
}

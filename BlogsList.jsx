import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import locale from 'rc-pagination/lib/locale/en_US';
import Swal from 'sweetalert2';
import lookUpService from '../../services/lookUpService';
import Blog from './Blog';
import blogService from '../../services/blogService';
import './blogstyles.css';
import PropTypes from 'prop-types';
import Header from '../elements/Header';

function BlogsList({ currentUser }) {
  const [pageData, setPageData] = useState({
    arrayOfBlogTypes: [],
    blogTypeComponents: [],
    arrayOfBlogs: [],
    blogComponents: [],
    filteredComponents: [],
    searchComponents: [],
    filterBlogComponents: 0,
    totalCount: 0,
    selectorValue: 0,
    blogTypes: { id: 0, value: '' },
    searchState: { index: 0, size: 8 },
    typeOptions: [],
    current: 1,
    pageIndex: 0,
    pageSize: 8,
    filter: '',
    search: '',
  });

  const crumbs = [
    { name: 'Apps', path: '/apps' },
    { name: 'Blogs', path: '/blogs' },
  ];

  const onChange = (page) => {
    setPageData((prevState) => {
      const data = { ...prevState };
      data.current = page;
      data.pageIndex = page - 1;

      return data;
    });
  };

  useEffect(() => {
    lookUpService.LookUp(['BlogTypes']).then(onGetTypesSuccess).catch(onGetBlogsError);
  }, []);

  useEffect(() => {
    if (!pageData.search && !pageData.selectorValue) {
      blogService.get(pageData.pageIndex, pageData.pageSize).then(onGetBlogsSuccess).catch(onGetBlogsError);
    } else if (pageData.search) {
      blogService
        .search(pageData.pageIndex, pageData.pageSize, pageData?.search)
        .then(onSearchSuccess)
        .catch(onSearchError);
    } else if (pageData.selectorValue) {
      blogService
        .getBlogByCategory(Number(pageData.selectorValue), pageData.pageIndex, pageData.pageSize)
        .then(onGetFilterBlogsSuccess)
        .catch(onGetBlogsError);
    }
  }, [pageData.pageIndex, pageData.pageSize, pageData.search, pageData.selectorValue]);

  const onGetTypesSuccess = (response) => {
    let arrayOfLog = response.item.blogTypes;

    setPageData((prevState) => {
      const pd = { ...prevState };
      pd.arrayOfBlogTypes = arrayOfLog;
      pd.typeOptions = arrayOfLog.map(mapBlogType);
      return pd;
    });
  };

  const onResetClicked = () => {
    setPageData((prevState) => {
      const pd = { ...prevState };
      pd.selectorValue = 0;
      pd.search = '';
      return pd;
    });
  };

  const onGetBlogsSuccess = (response) => {
    let blogsArray = response.item.pagedItems;

    setPageData((prevState) => {
      const pd = { ...prevState };
      pd.arrayOfBlogs = blogsArray;
      pd.blogComponents = blogsArray.map(mapBlog);
      pd.totalCount = response.item.totalCount;
      return pd;
    });
  };

  const onGetBlogsError = () => {
    Swal.fire('Error', 'failed to load blogs', 'error');
  };

  const mapBlog = (aBlog) => {
    return <Blog blog={aBlog} key={aBlog.id} onDeleteClicked={onDeleteClicked} currentUser={currentUser} />;
  };

  const onDeleteClicked = useCallback((myBlog) => {
    Swal.fire({
      showCancelButton: true,
      title: 'Are you sure?',
      text: "You can't undo this",
      confirmButtonText: 'Delete',
      icon: 'warning',
    }).then((result) => {
      if (result.isConfirmed) {
        blogService
          .deleteBlog(myBlog.id)
          .then(() => getDeleteSuccessHandler(myBlog.id))
          .catch(onDeleteBlogError);
      }
    });
  }, []);

  const getDeleteSuccessHandler = (idToBeDeleted) => {
    setPageData((prevState) => {
      const pd = { ...prevState };
      pd.arrayOfBlogs = [...pd.arrayOfBlogs];

      const idxOf = pd.arrayOfBlogs.findIndex((blog) => {
        let result = false;

        if (blog.id === idToBeDeleted) {
          result = true;
        }
        return result;
      });

      if (idxOf >= 0) {
        pd.arrayOfBlogs.splice(idxOf, 1);
        pd.blogComponents = pd.arrayOfBlogs.map(mapBlog);
        pd.totalCount = pd.totalCount - 1;
      }
      return pd;
    });
  };

  const onDeleteBlogError = () => {
    Swal.fire('Error', 'failed to load current user', 'error');
  };

  const mapBlogType = (blogType) => {
    return (
      <option key={'BlogTypeOp_' + blogType.id} value={blogType.id}>
        {blogType.name}
      </option>
    );
  };

  const onFormFieldChange = (e) => {
    const { value } = e.target;

    setPageData((prevState) => {
      const pd = { ...prevState };
      pd.search = value;
      return pd;
    });
  };

  const onTypeChange = (event) => {
    const target = event.target;
    const fieldValue = target.value;
    setPageData((prevState) => {
      const pd = { ...prevState };
      pd.selectorValue = fieldValue;
      return pd;
    });
  };

  const onSearchSuccess = (response) => {
    let arrayOfResults = response.data.item.pagedItems;
    setPageData((prevState) => {
      const pd = { ...prevState };
      pd.arrayOfBlogs = arrayOfResults;
      pd.blogComponents = arrayOfResults.map(mapBlog);
      pd.totalCount = response.data.item.totalCount;
      return pd;
    });
  };

  const onSearchError = () => {
    Swal.fire('Error getting results', 'Please fill in fields correctly', 'error');
  };

  const onGetFilterBlogsSuccess = (response) => {
    let arrayOfFilters = response.data.item.pagedItems;
    setPageData((prevState) => {
      const pd = { ...prevState };
      pd.arrayOfBlogs = arrayOfFilters;
      pd.blogComponents = arrayOfFilters.map(mapBlog);
      pd.totalCount = response.data.item.totalCount;
      return pd;
    });
  };

  return (
    <>
      <div>
        <Container>
          <Row>
            <Col>
              <Header title="Blogs" crumbs={crumbs} />
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col>
              <Card>
                <Card.Body className="p-4">
                  <div className="container">
                    <div className="row">
                      <div className="col-md-2 mx-auto">
                        <div className="form-group">
                          {currentUser.isLoggedIn === true && (
                            <Link
                              className="link-btn btn btn-library primary-color-head btn-color-font text-white b-2"
                              type="button"
                              to="/blogs/new">
                              Create a Blog Post
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4 mx-auto">
                        <div className="form-group">
                          <i
                            className="mdi mdi-magnify search-icon py-1 px-3 position-absolute end-50"
                            role="button"></i>
                          <input
                            type="text"
                            id="search"
                            name="search"
                            placeholder="search"
                            className="form-control pl-2"
                            onChange={onFormFieldChange}
                            value={pageData.search}
                          />
                        </div>
                      </div>
                      <div className="col-md-2 mx-auto">
                        <div className="form-group">
                          <h5 className="text-center">Filter By Category</h5>
                        </div>
                      </div>
                      <div className="col-md-3 mx-auto">
                        <div className="form-group">
                          <select
                            id="filter"
                            name="filter"
                            value={pageData.selectorValue}
                            className="form-control"
                            onChange={onTypeChange}>
                            <option value="0">Select a Blog Category</option>
                            {pageData?.typeOptions}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-1 mx-auto">
                        <div className="form-group">
                          <button onClick={onResetClicked} className="btn btn-secondary">
                            Reset
                          </button>
                        </div>
                      </div>
                      <div className="row mt-3">{pageData.arrayOfBlogs.map(mapBlog)}</div>
                    </div>
                  </div>
                  <Pagination
                    className="mt-1"
                    onChange={onChange}
                    current={pageData?.current}
                    total={pageData?.totalCount}
                    locale={locale}
                    defaultPageSize={pageData?.pageSize}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

BlogsList.propTypes = {
  currentUser: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
    avatarUrl: PropTypes.string,
    email: PropTypes.string,
    firstName: PropTypes.string,
    mi: PropTypes.string,
    lastName: PropTypes.string,
    id: PropTypes.number,
  }),
  values: PropTypes.shape({
    search: PropTypes.string,
  }),
};

export default BlogsList;

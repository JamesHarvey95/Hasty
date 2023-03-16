import lazy from "react";
const NewBlog = lazy(() => import("../components/blogs/BlogForm"));
const EditBlog = lazy(() => import("../components/blogs/BlogForm"));

const blogRoutes = [
  {
    path: "/blogs/new",
    name: "Create a Blog",
    exact: true,
    element: NewBlog,
    roles: ["Admin", "Proprietor", "Civilian", "Active Duty", "Veteran"],
    isAnonymous: false,
  },
  {
    path: "/blogs/:id/edit",
    name: "Edit a Blog",
    exact: true,
    element: EditBlog,
    roles: [
      "Admin",
      "Proprietor",
      "Civilian",
      "Active Duty",
      "Veteran",
      "Proprietor",
    ],
    isAnonymous: false,
  },
];

const errorRoutes = [
  {
    path: "*",
    name: "Error - 404",
    element: PageNotFound,
    roles: [],
    exact: true,
    isAnonymous: false,
  },
];

const allRoutes = [...errorRoutes, ...blogRoutes];

export default allRoutes;

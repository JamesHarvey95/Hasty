using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests.Blogs;
using Sabio.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using static System.Net.Mime.MediaTypeNames;

namespace Sabio.Services
{
    public class BlogService : IBlogService
    {
        IDataProvider _data = null;

        public BlogService(IDataProvider data)
        {
            _data = data;
        }

        public void Delete(int id)
        {
            string procName = "[dbo].[Blogs_Delete]";
            _data.ExecuteNonQuery(procName,
            inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@Id", id);

            }, returnParameters: null);

        }

        public int Add(BlogAddRequest model, int userId)
        {
            int id = 0;

            string procName = "[dbo].[Blogs_Insert]";
            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    AddCommonParams(model, col, userId);

                    SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                    idOut.Direction = ParameterDirection.Output;

                    col.Add(idOut);
                }, returnParameters: delegate (SqlParameterCollection returnCollection)
                {
                    object oId = returnCollection["@Id"].Value;

                    int.TryParse(oId.ToString(), out id);

                    Console.WriteLine("");
                });

            return id;
        }

        public Paged<Blog> GetByCategory(int id, int pageIndex, int pageSize)
        {
            string procName = "[dbo].[Blogs_Select_BlogCategory_Paginated]";

            Paged<Blog> pagedList = null;

            List<Blog> list = null;

            int totalCount = 0;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramCollection)
            {
                paramCollection.AddWithValue("@BlogCategory", id);
                paramCollection.AddWithValue("@pageIndex", pageIndex);
                paramCollection.AddWithValue("@pageSize", pageSize);

            }, (reader, recordSetIndex) =>
            {
                int startingIndex = 0;

                Blog aBlog = MapSingleBlog(reader, ref startingIndex);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(startingIndex++);
                }
                
                if (list == null)
                {
                    list = new List<Blog>();
                }
                list.Add(aBlog);
            }
            );

            if (list != null)
            {
                pagedList = new Paged<Blog>(list, pageIndex, pageSize, totalCount);
            }

            return pagedList;
        }

        public Paged<Blog> GetAll(int pageIndex, int pageSize)
        {
            Paged<Blog> pagedList = null;

            List<Blog> list = null;

            int totalCount = 0;

            string procName = "[dbo].[Blogs_SelectAll_Paginated]";

            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@PageIndex", pageIndex);
                parameterCollection.AddWithValue("@PageSize", pageSize);
            }
            , (reader, recordSetIndex) =>
            {
                int startingIndex = 0;

                Blog aBlog = MapSingleBlog(reader, ref startingIndex);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(startingIndex++);
                }
                if (list == null)
                {
                    list = new List<Blog>();
                }
                list.Add(aBlog);
            }
            );

            if (list != null)
            {
                pagedList = new Paged<Blog>(list, pageIndex, pageSize, totalCount);
            }

            return pagedList;
        }

        public Paged<Blog> GetByCreatedBy(int createdBy, int pageIndex, int pageSize)
        {
            string procName = "[dbo].[Blogs_SelectByCreatedBy_Paginated]";

            Paged<Blog> pagedList = null;

            List<Blog> list = null;

            int totalCount = 0;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramCollection)
            {

                paramCollection.AddWithValue("@CreatedBy", createdBy);
                paramCollection.AddWithValue("@pageIndex", pageIndex);
                paramCollection.AddWithValue("@pageSize", pageSize);

            },  (reader, recordSetIndex) =>
            {
                int startingIndex = 0;

                Blog aBlog = MapSingleBlog(reader, ref startingIndex);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(startingIndex++);
                }
                if (list == null) 
                {
                    list = new List<Blog>();
                }
                list.Add(aBlog);
            }
            );

            if (list != null)
            {
                pagedList = new Paged<Blog>(list, pageIndex, pageSize, totalCount);
            }

            return pagedList;
        }

        public Blog GetById(int id)
        {
            string procName = "[dbo].[Blogs_SelectById]";

            Blog blog = null;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramCollection)
            {

                paramCollection.AddWithValue("@Id", id);

            }, delegate (IDataReader reader, short set)
            {
                int index = 0;

                blog = MapSingleBlog(reader, ref index);
               
            }
            );

            return blog;
        }

        public void Update(BlogUpdateRequest model, int userId)
        {
            string procName = "[dbo].[Blogs_Update]";
            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    AddCommonParams(model, col, userId);
                    col.AddWithValue("@Id", model.Id);

                }, returnParameters: null);
        }

        public Paged<Blog> SearchPagination(int pageIndex, int pageSize, string query)
        {
            Paged<Blog> pagedList = null;
            List<Blog> list = null;
            int totalCount = 0;

            _data.ExecuteCmd(
                "[dbo].[Blogs_Search_Pagination]",
                (param) =>

                {
                    param.AddWithValue("@PageIndex", pageIndex);
                    param.AddWithValue("@PageSize", pageSize);
                    param.AddWithValue("@Query", query);
                },
                (reader, recordSetIndex) =>
                {
                    int startingIndex = 0;

                    Blog blog = MapSingleBlog(reader, ref startingIndex);
                    if (totalCount == 0)
                    {
                        totalCount = reader.GetSafeInt32(startingIndex++);
                    }

                    if (list == null)
                    {
                        list = new List<Blog>();
                    }

                    list.Add(blog);
                }
                );
            if (list != null)
            {
                pagedList = new Paged<Blog>(list, pageIndex, pageSize, totalCount);
            }
            return pagedList;
        }

        private static Blog MapSingleBlog(IDataReader reader, ref int startingIndex)
        {
            Blog blog = new Blog();
            LookUp blogType = new LookUp();
            LookUp blogStatus = new LookUp();
            BaseUser authorId = new BaseUser();
            blog.BlogType = blogType;
            blog.BlogStatus = blogStatus;
            blog.Author = authorId;

            blog.Id = reader.GetSafeInt32(startingIndex++);
            blogType.Id = reader.GetSafeInt32(startingIndex++);
            authorId.Id = reader.GetSafeInt32(startingIndex++);
            blog.Title = reader.GetSafeString(startingIndex++);
            blog.Subject = reader.GetSafeString(startingIndex++);
            blog.Content = reader.GetSafeString(startingIndex++);
            blog.ImageUrl = reader.GetSafeString(startingIndex++);
            blog.DatePublished = reader.GetSafeDateTime(startingIndex++);
            authorId.FirstName = reader.GetSafeString(startingIndex++);
            authorId.Mi = reader.GetSafeString(startingIndex++);
            authorId.LastName = reader.GetSafeString(startingIndex++);
            authorId.AvatarUrl = reader.GetSafeString(startingIndex++);
            blogType.Name = reader.GetSafeString(startingIndex++);
            blogStatus.Id = reader.GetSafeInt32(startingIndex++);
            blogStatus.Name = reader.GetSafeString(startingIndex++);
            blog.IsPublished = reader.GetSafeBool(startingIndex++);

            return blog;
        }

        private static void AddCommonParams(BlogAddRequest model, SqlParameterCollection col, int userId)
        {
            col.AddWithValue("@BlogTypeId", model.BlogTypeId);
            col.AddWithValue("@AuthorId", userId);
            col.AddWithValue("@Title", model.Title);
            col.AddWithValue("@Subject", model.Subject);
            col.AddWithValue("@Content", model.Content);
            col.AddWithValue("@ImageUrl", model.ImageUrl);
            col.AddWithValue("@DatePublished", model.DatePublished);
            col.AddWithValue("@BlogStatusId", model.BlogStatusId);
            col.AddWithValue("@IsPublished", model.IsPublished);
        }
    }
}

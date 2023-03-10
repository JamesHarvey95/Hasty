using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests.Blogs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sabio.Services.Interfaces
{
    public interface IBlogService
    {
        void Delete(int id);
        void Update(BlogUpdateRequest model, int userId);
        int Add(BlogAddRequest model, int userId);
        Paged<Blog> GetByCategory(int id, int pageIndex, int pageSize);
        Paged<Blog> GetAll(int pageIndex, int pageSize);
        Paged<Blog> GetByCreatedBy(int createdBy, int pageIndex, int pageSize);
        Blog GetById(int id);
        Paged<Blog> SearchPagination(int pageIndex, int pageSize, string query);
    }
}

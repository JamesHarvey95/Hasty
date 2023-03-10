using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sabio.Models.Domain
{
    public class Blog
    {
        public int Id { get; set; }
        public LookUp BlogType { get; set; }
        public BaseUser Author { get; set; }
        public string Title { get; set; }
        public string Subject { get; set; }
        public string Content { get; set; }
        public bool IsPublished { get; set; }
        public string ImageUrl { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }
        public DateTime DatePublished { get; set; }
        public LookUp BlogStatus { get; set; }
    }
}

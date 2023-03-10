using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sabio.Models.Requests.Blogs
{
    public class BlogAddRequest
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int BlogTypeId { get; set; }
        [Required]
        [MinLength(1), MaxLength(100)]
        public string Title { get; set; }
        [MaxLength(50)]
        public string Subject { get; set; }
        [Required]
        [MinLength(1), MaxLength(4000)]
        public string Content { get; set; }
        [MaxLength(255)]
        public string ImageUrl { get; set; }
        public DateTime? DatePublished { get; set; }
        public DateTime? DateModified { get; set; }
        [Required]
        public int BlogStatusId { get; set; }
        [Required]
        public bool IsPublished { get; set; }
    }
}

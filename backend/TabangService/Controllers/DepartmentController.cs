using Microsoft.AspNetCore.Mvc;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Models;
using TabangService.DAL.Repository;
using AutoMapper;

namespace TabangService.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly IMapper _mapper;
        public DepartmentController(IMapper mapper)
        {
            _mapper = mapper;
        }
        [HttpGet]
        public async Task<ActionResult<List<SubDepartmentDTO>>> GetSubDepartments()
        {
            return Ok(await new DepartmentRepository(_mapper).GetSubDepartments());
        }
        [HttpPost]
        public IActionResult SaveSubDepartment([FromBody] SubDepartmentDTO subDepartment)
        {
            return Ok(new DepartmentRepository(_mapper).SaveSubDepartment(subDepartment));
        }

        [HttpGet]
        public async Task<ActionResult<List<Department>>> GetDepartments()
        {
            try
            {

                return Ok(await new DepartmentRepository(_mapper).GetDepartments());
            }
            catch (Exception ex)
            {

                return NotFound();
            }
        }
        [HttpPost]
        public async Task<ActionResult<DepartmentQueryResult>> GetDepartments([FromBody] DepartmentQuery filter)
        {
            if (filter == null) return BadRequest("Invalid query parameters.");

            return Ok(await new DepartmentRepository(_mapper).GetDepartments(filter));
        }

        [HttpPost]
        public IActionResult SaveDepartment([FromBody] DepartmentDTO department)
        {
            return Ok(new DepartmentRepository(_mapper).SaveDepartment(department));
        }

        //[HttpGet]
        //public async Task<ActionResult<List<MemberDTO>>> GetMembers(int _subDepId)
        //{
        //    return Ok(await new DepartmentRepository(_mapper).GetMembersbySubDepartmentId(_subDepId));
        //}

        //[HttpPost]
        //public IActionResult AddMember(int _subDepartmentId, int _userId)
        //{
        //    try
        //    {

        //        return Ok(new DepartmentRepository(_mapper).AddMember(_subDepartmentId, _userId));
        //    }
        //    catch (Exception ex)
        //    {

        //        throw;
        //    }
        //}
        //[HttpPost]
        //public IActionResult RemoveMember(int _memberId)
        //{
        //    try
        //    {
        //        new DepartmentRepository(_mapper).RemoveMember(_memberId);
        //        return Ok();
        //    }
        //    catch (Exception ex)
        //    {

        //        throw;
        //    }
        //}

        //[HttpPost]
        //public IActionResult SetSupervisor(int _memberId)
        //{
        //    try
        //    {
        //        new DepartmentRepository(_mapper).SetSupervisor(_memberId);
        //        return Ok();
        //    }
        //    catch (Exception ex)
        //    {

        //        throw;
        //    }
        //}
    }
}

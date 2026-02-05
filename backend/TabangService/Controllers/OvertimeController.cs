using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using TabangService.DAL.Models;
using TabangService.DAL.Models.DTO;
using TabangService.DAL.Repository;

namespace TabangService.Controllers
{
    [Route("api/[controller]/[action]")]
    public class OvertimeController : ControllerBase
    {
        private readonly IMapper _mapper;
        public OvertimeController(IMapper mapper)
        {
            _mapper = mapper;
        }
        [HttpGet]
        public async Task<ActionResult<List<OvertimeDTO>>> GetOvertimes(int _supId)
        {
            return Ok(await new OvertimeRepository(_mapper).GetOvertimes(_supId));
        }
        [HttpPost]
        public IActionResult SaveOvertime([FromBody] OvertimeDTO _overtimeDTO)
        {
            return Ok(new OvertimeRepository(_mapper).SaveOvertime(_overtimeDTO));
        }

        [HttpPost]
        public IActionResult ApproveOvertime(int userId, bool isApprove, int overtimeId)
        {
            return Ok(new OvertimeRepository(_mapper).ApproveOvertime(userId, isApprove, overtimeId));
        }
    }
}

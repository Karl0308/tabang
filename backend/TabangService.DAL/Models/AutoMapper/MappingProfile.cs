using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TabangService.DAL.Models.DTO;

namespace TabangService.DAL.Models.AutoMapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            //Overtime
            CreateMap<Overtime, OvertimeDTO>()
            .ForMember(dest => dest.TicketNumber, opt => opt.MapFrom(src => src.Ticket != null?  src.Ticket.TicketNumber : "" ))
            .ForMember(dest => dest.UpdatedByFullName, opt => opt.MapFrom(src => src.UpdatedBy != null ? src.UpdatedBy.FullName :""));

            CreateMap<OvertimeDTO, Overtime>();

            //SubDepartment
            CreateMap<SubDepartment, SubDepartmentDTO>()
                 .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : ""));
        }
    }
}

using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TabangService.DAL.Builder
{
    public class Hasher
    {
        private readonly PasswordHasher<IdentityUser> _passwordHasher = new PasswordHasher<IdentityUser>();

        public string HashPassword(string password)
        {
            return _passwordHasher.HashPassword(null, password); // Passing `null` as the user
        }

        public bool VerifyPassword(string hashedPassword, string inputPassword)
        {
            var result = _passwordHasher.VerifyHashedPassword(null, hashedPassword, inputPassword); // Passing `null` as the user
            return result == PasswordVerificationResult.Success;
        }

    }
}

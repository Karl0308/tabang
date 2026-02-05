using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace TabangService.DAL.Builder
{
    public class GenerateID
    {
        public string GenerateRandomString()
        {
            string allowedChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding 'I' and 'O'
            int length = 6;

            Random random = new Random();
            StringBuilder sb = new StringBuilder(length);

            for (int i = 0; i < length; i++)
            {
                int index = random.Next(0, allowedChars.Length);
                sb.Append(allowedChars[index]);
            }

            return sb.ToString();
        }

        public string HashAndEncode(string input)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] inputBytes = Encoding.UTF8.GetBytes(input);
                byte[] hashBytes = sha256.ComputeHash(inputBytes);

                // Convert the hash bytes to a shorter alphanumeric representation
                string allowedChars = "ABCDEFGHJKLMNPQRSTUVWXYZ1234567890"; // Excluding 'I' and 'O'
                int desiredLength = 6;

                StringBuilder sb = new StringBuilder(desiredLength);
                for (int i = 0; i < desiredLength; i++)
                {
                    int index = hashBytes[i] % allowedChars.Length;
                    sb.Append(allowedChars[index]);
                }

                return InsertCharacter(sb.ToString(), '-', 3) ;
            }
        }
        static string InsertCharacter(string original, char character, int position)
        {
            if (position < 0 || position > original.Length)
            {
                throw new ArgumentOutOfRangeException(nameof(position));
            }

            StringBuilder sb = new StringBuilder(original);
            sb.Insert(position, character);
            return sb.ToString();
        }
    }
}

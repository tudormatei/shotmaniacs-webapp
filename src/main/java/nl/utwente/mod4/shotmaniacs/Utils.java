package nl.utwente.mod4.shotmaniacs;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import nl.utwente.mod4.shotmaniacs.routes.AuthRoute;

public class Utils {
    public static String extractNameFromHeader(String header) {
        String token = extractTokenFromHeader(header);

        try{
            Claims claims = Jwts.parser()
                    .verifyWith(AuthRoute.key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return claims.getSubject();
        }
        catch (JwtException e) {
            System.out.println("Could not extract name from token: " + e);
        }

        return "";
    }

    public static String extractRoleFromHeader(String header) {
        String token = extractTokenFromHeader(header);

        try{
            Claims claims = Jwts.parser()
                    .verifyWith(AuthRoute.key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return (String) claims.get("role");
        }
        catch (JwtException e) {
            System.out.println("Could not extract role from token: " + e);
        }

        return "";
    }

    public static String extractTokenFromHeader(String header) {
        String token = "";
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        return token;
    }
}

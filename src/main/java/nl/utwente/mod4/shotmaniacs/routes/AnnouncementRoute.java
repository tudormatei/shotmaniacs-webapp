package nl.utwente.mod4.shotmaniacs.routes;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import nl.utwente.mod4.shotmaniacs.dao.DatabaseConnection;
import nl.utwente.mod4.shotmaniacs.model.Announcement;

@Path("/announcement")
public class AnnouncementRoute {

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Announcement createAnnouncement(@HeaderParam("Authorization") String authorizationHeader, Announcement announcement) {
        String name = extractNameFromToken(authorizationHeader);
        int cmid;

        try (Connection connection = DatabaseConnection.INSTANCE.getConnection()) {
            String checkClientQuery = "SELECT cmid FROM crewmember WHERE name = ?";
            PreparedStatement checkClientStmt = connection.prepareStatement(checkClientQuery);
            checkClientStmt.setString(1, name);
            ResultSet checkClientResult = checkClientStmt.executeQuery();

            if (checkClientResult.next()) {
                int lastAid = getLastAnnouncementId(connection);
                int newAid = lastAid + 1;

                cmid = checkClientResult.getInt("cmid");
                String insertAnnouncementQuery = "INSERT INTO announcement (aid, cmid, name, date, message, urgency) VALUES (?, ?, ?, ?, ?, ?)";
                PreparedStatement insertAnnouncementStmt = connection.prepareStatement(insertAnnouncementQuery);
                insertAnnouncementStmt.setInt(1, newAid);
                insertAnnouncementStmt.setInt(2, cmid);
                insertAnnouncementStmt.setString(3, name);
                insertAnnouncementStmt.setString(4, announcement.getAnnouncementDate());
                insertAnnouncementStmt.setString(5, announcement.getAnnouncementMessage());
                insertAnnouncementStmt.setInt(6, announcement.getUrgency());
                insertAnnouncementStmt.executeUpdate();


                if (announcement.getCrewMembers() != null && !announcement.getCrewMembers().isEmpty()) {
                    if (announcement.getCrewMembers().contains("everyone")) {
                        createAnnouncementContract(newAid, 0, connection);
                    } else {
                        for (String crewMember : announcement.getCrewMembers()) {
                            int crewMemberId = getCrewMemberIdByName(crewMember, connection);
                            if (crewMemberId > 0) {
                                createAnnouncementContract(newAid, crewMemberId, connection);
                            }
                        }
                    }
                }


                announcement.setAnnouncementID(newAid);
                return announcement;
            }
        } catch (SQLException sqlError) {
            System.err.println("Error connecting: " + sqlError);
        }
        return null;
    }

    private int getLastAnnouncementId(Connection connection) throws SQLException {
        String getLastAidQuery = "SELECT MAX(aid) AS last_aid FROM announcement";
        PreparedStatement getLastAidStmt = connection.prepareStatement(getLastAidQuery);
        ResultSet getLastAidResult = getLastAidStmt.executeQuery();

        int lastAid = 0;
        if (getLastAidResult.next()) {
            lastAid = getLastAidResult.getInt("last_aid");
        }
        return lastAid;
    }

    private int getCrewMemberIdByName(String crewMemberName, Connection connection) throws SQLException {
        String getCrewMemberIdQuery = "SELECT cmid FROM crewmember WHERE name = ?";
        PreparedStatement getCrewMemberIdStmt = connection.prepareStatement(getCrewMemberIdQuery);
        getCrewMemberIdStmt.setString(1, crewMemberName);
        ResultSet crewMemberIdResult = getCrewMemberIdStmt.executeQuery();
        if (crewMemberIdResult.next()) {
            return crewMemberIdResult.getInt("cmid");
        }
        return -1;
    }

    private void createAnnouncementContract(int aid, int cmid, Connection connection) throws SQLException {
        String insertAnnouncementContractQuery = "INSERT INTO announcementcontract (aid, cmid) VALUES (?, ?)";
        PreparedStatement insertAnnouncementContractStmt = connection.prepareStatement(insertAnnouncementContractQuery);
        insertAnnouncementContractStmt.setInt(1, aid);
        insertAnnouncementContractStmt.setInt(2, cmid);
        insertAnnouncementContractStmt.executeUpdate();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Announcement> getAllAnnouncements(@HeaderParam("Authorization") String authorizationHeader) {
        List<Announcement> announcements = new ArrayList<>();
        String name = extractNameFromToken(authorizationHeader);

        try (Connection connection = DatabaseConnection.INSTANCE.getConnection()) {
            String getUnlinkedAnnouncementsQuery = "SELECT * FROM announcement WHERE aid NOT IN (SELECT aid FROM announcementcontract)";
            PreparedStatement getUnlinkedAnnouncementsStmt = connection.prepareStatement(getUnlinkedAnnouncementsQuery);
            ResultSet unlinkedAnnouncementsResult = getUnlinkedAnnouncementsStmt.executeQuery();

            while (unlinkedAnnouncementsResult.next()) {
                Announcement announcement = createAnnouncementFromResultSet(unlinkedAnnouncementsResult, connection);
                if (!announcement.getAnnouncementName().equals(name)) {
                    announcements.add(announcement);
                }
            }

            String getLinkedAnnouncementsQuery = "SELECT * FROM announcement WHERE aid IN (SELECT aid FROM announcementcontract WHERE cmid = ?)";
            PreparedStatement getLinkedAnnouncementsStmt = connection.prepareStatement(getLinkedAnnouncementsQuery);
            int cmid = getCrewMemberIdByName(name, connection);
            getLinkedAnnouncementsStmt.setInt(1, cmid);
            ResultSet linkedAnnouncementsResult = getLinkedAnnouncementsStmt.executeQuery();

            while (linkedAnnouncementsResult.next()) {
                Announcement announcement = createAnnouncementFromResultSet(linkedAnnouncementsResult, connection);
                if (!announcement.getAnnouncementName().equals(name)) {
                    announcements.add(announcement);
                }
            }

            String getOwnAnnouncementsQuery = "SELECT * FROM announcement WHERE name = ?";
            PreparedStatement getOwnAnnouncementsStmt = connection.prepareStatement(getOwnAnnouncementsQuery);
            getOwnAnnouncementsStmt.setString(1, name);
            ResultSet ownAnnouncementsResult = getOwnAnnouncementsStmt.executeQuery();

            while (ownAnnouncementsResult.next()) {
                Announcement announcement = createAnnouncementFromResultSet(ownAnnouncementsResult, connection);
                announcements.add(announcement);
            }

        } catch (SQLException sqlError) {
            System.err.println("Error connecting: " + sqlError);
        }

        return announcements;
    }

    private Announcement createAnnouncementFromResultSet(ResultSet resultSet, Connection connection) throws SQLException {
        Announcement announcement = new Announcement(
                resultSet.getString("name"),
                resultSet.getString("message"),
                resultSet.getInt("cmid"),
                resultSet.getString("date"),
                resultSet.getInt("aid"),
                resultSet.getInt("urgency"));

        List<String> crewMembers = fetchCrewMembersForAnnouncement(announcement.getAnnouncementID(), connection);
        announcement.setCrewMembers(crewMembers);

        return announcement;
    }

    private List<String> fetchCrewMembersForAnnouncement(int aid, Connection connection) throws SQLException {
        List<String> crewMembers = new ArrayList<>();
        String getCrewMembersQuery = "SELECT name FROM crewmember WHERE cmid IN (SELECT cmid FROM announcementcontract WHERE aid = ?)";
        PreparedStatement getCrewMembersStmt = connection.prepareStatement(getCrewMembersQuery);
        getCrewMembersStmt.setInt(1, aid);
        ResultSet crewMembersResult = getCrewMembersStmt.executeQuery();
        while (crewMembersResult.next()) {
            crewMembers.add(crewMembersResult.getString("name"));
        }
        return crewMembers;
    }

    private String extractNameFromToken(String header) {
        String token = "";
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        try {
            Claims claims = Jwts.parser().verifyWith(AuthRoute.key).build().parseSignedClaims(token)
                    .getPayload();

            return claims.getSubject();
        } catch (JwtException e) {
            System.out.println("Could not extract name for calendar from token: " + e);
        }

        return "";
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public void deleteAnnouncement(@HeaderParam("Authorization") String authorizationHeader, Announcement announcement) {
        try (Connection connection = DatabaseConnection.INSTANCE.getConnection()) {
            String deleteAnnouncementQuery = "DELETE FROM announcement WHERE aid = ?";
            PreparedStatement deleteAnnouncementStmt = connection.prepareStatement(deleteAnnouncementQuery);
            deleteAnnouncementStmt.setInt(1, announcement.getAnnouncementID());
            deleteAnnouncementStmt.executeUpdate();
        } catch (SQLException sqlError) {
            System.err.println("Error connecting: " + sqlError);
        }
    }
}
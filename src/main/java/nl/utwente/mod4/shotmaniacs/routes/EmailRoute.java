package nl.utwente.mod4.shotmaniacs.routes;

import javax.mail.*;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;

import java.sql.*;

import nl.utwente.mod4.shotmaniacs.dao.DatabaseConnection;

import java.util.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import nl.utwente.mod4.shotmaniacs.model.Announcement;
import nl.utwente.mod4.shotmaniacs.model.Event;

@Path("/email")
public class EmailRoute {

    private static Session getEmailSession() {
        final String username = "projectshotmaniac@gmail.com";
        final String password = "olea nnel pgra ghuy";
        Properties prop = new Properties();
        prop.put("mail.smtp.host", "smtp.gmail.com");
        prop.put("mail.smtp.port", "587");
        prop.put("mail.smtp.auth", "true");
        prop.put("mail.smtp.starttls.enable", "true");

        Session session = Session.getInstance(prop, new javax.mail.Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });
        return session;
    }

    /**
     *
     *
     * @param announcement
     */
    @POST
    @Path("/sendannouncement")
    @Consumes(MediaType.APPLICATION_JSON)
    public static void sendEmail(Announcement announcement) {
        if (announcement.getUrgency() == 2) {
            List<String> crewMembers = announcement.getCrewMembers();

            List<String> receiverEmail = new ArrayList<>();
            Connection connection = DatabaseConnection.INSTANCE.getConnection();
            if (announcement.getAnnouncementCMID() == 0) {
                try {
                    String checkClientQuery = "SELECT email FROM crewmember";
                    PreparedStatement checkClientStmt = connection.prepareStatement(
                            checkClientQuery);
                    ResultSet checkClientResult = checkClientStmt.executeQuery();
                    while (checkClientResult.next()) {
                        receiverEmail.add(checkClientResult.getString("email"));
                    }
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }
            } else {
                try {
                    for (int i = 0; i < crewMembers.size(); i++) {
                        String checkClientQuery = "SELECT email FROM crewmember WHERE name = ?";
                        PreparedStatement checkClientStmt = connection.prepareStatement(
                                checkClientQuery);
                        checkClientStmt.setString(1, crewMembers.get(i));
                        ResultSet checkClientResult = checkClientStmt.executeQuery();
                        while (checkClientResult.next()) {
                            receiverEmail.add(checkClientResult.getString("email"));
                        }
                    }
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }
            }

            try {
                for (String email : receiverEmail) {
                    Message message = new MimeMessage(getEmailSession());
                    message.setFrom(new InternetAddress("projectshotmaniac@gmail.com"));
                    message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(email));

                    message.setSubject("URGENT ANNOUNCEMENT");
                    message.setText(announcement.getAnnouncementMessage());

                    Transport.send(message);
                }
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Sends an email to shotmaniacs admins when a new booking form is filled and submitted by the client.
     * @param event contains the booking information
     */
    @POST
    @Path("/newbooking")
    @Consumes(MediaType.APPLICATION_JSON)
    public void letAdminKnowOfNewBookingForm(Event event) {
        List<String> admins = new ArrayList<>();

        Connection connection = DatabaseConnection.INSTANCE.getConnection();
        try (connection) {
            //we take all the admins from the database
            String getAllCrewMembersQuery = "SELECT email FROM crewmembers WHERE role = 'admin'";
            PreparedStatement getAllCrewMembersStmt = connection.prepareStatement(
                    getAllCrewMembersQuery);
            ResultSet resultSet = getAllCrewMembersStmt.executeQuery();
            while (resultSet.next()) {
                admins.add(resultSet.getString("email"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        try {
            //compose the message of the email
            Message message = new MimeMessage(getEmailSession());
            message.setFrom(new InternetAddress("projectshotmaniac@gmail.com"));
            for (String admin : admins) {
                message.addRecipient(Message.RecipientType.TO, new InternetAddress(admin));
            }
            ;
            message.setSubject("New Booking Request: " + event.getEventName());
            message.setText(
                    "A new booking request has been added to your dashboard.\n" +
                            "\n" + "Event Name: " + event.getEventName() + "\n" +
                            "Event Type: " + event.getEventType() + "\n" +
                            "Event Date: " + event.getEventDate() + "\n" +
                            "Event Location: " + event.getEventLocation() +
                            "\n" + "Event Duration: " + event.getEventDuration() +
                            " hours\n" + "Client Name: " + event.getClientName() +
                            "\n" + "Client Email: " + event.getClientEmail());

            Transport.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
        }

    }

    public static void bookingAccepted(int eid, String status) {
        String receiverEmail = "";
        String receiverName = "";
        String event_name = "";
        String event_date = "";

        Connection connection = DatabaseConnection.INSTANCE.getConnection();
        try (connection) {
            String query = "SELECT c.email as client_email, c.name as client_name, e.name as event_name, e.date as event_date from event e JOIN client c ON e.cid = c.cid WHERE e.eid = ?";
            PreparedStatement getEmail = connection.prepareStatement(query);
            getEmail.setInt(1, eid);
            ResultSet resultSet = getEmail.executeQuery();
            while (resultSet.next()) {
                receiverEmail = resultSet.getString("client_email");
                receiverName = resultSet.getString("client_name");
                event_name = resultSet.getString("event_name");
                event_date = resultSet.getString("event_date");
            }
            try {
                Message message = new MimeMessage(getEmailSession());
                message.setFrom(new InternetAddress("projectshotmaniac@gmail.com"));
                message.setRecipients(Message.RecipientType.TO,
                                      InternetAddress.parse(receiverEmail));

                message.setSubject("ShotManiacs Event Booking");
                if (status.contains("accepted")) {
                    message.setContent(
                            "<h1>Your booking has been accepted!</h1><br><br>" +
                                    "<p>A production manager has accepted your booking.</p><br>" +
                                    "<b>Booking details</b><br>" + "<p>Name: " + event_name +
                                    "</p>" + "<p>Date: " + event_date.split("T")[0] + "</p>" +
                                    "<p>Time:"+ event_date.split("T")[1] +"</p>",
                            "text/html");
                } else {
                    message.setContent(
                            "<h1>Your booking has been denied!</h1><br><br>" +
                                    "<p>A production manager has denied your booking.</p><br>" +
                                    "<b>Booking details</b><br>" + "<p>Name: " + event_name +
                                    "</p>" + "<p>Date: " + event_date.split("T")[0] + "</p>" +
                                    "<p>Time:"+ event_date.split("T")[1] +"</p>" +
                                    "<p>Please contact us for more information.</p>",
                            "text/html");
                }
                Transport.send(message);

            } catch (MessagingException e) {
                e.printStackTrace();
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }


    }
}

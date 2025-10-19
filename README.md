This was the Prompt
Prompt for  Frontend Web App
 Generation
 This document contains the full structured prompt to be uploaded into Lovable.dev in order to
 generate a fully functional **frontend web application** for the NAMSA (Namibian Music System
 Administration). The backend Spring Boot REST APIs are already designed and deployed. The
 provided Postman collection contains all API endpoints. This prompt ensures the frontend
 consumes all APIs correctly and follows the required flows for Artists, Companies, and Admins.
 ### System Overview- System Name: **NAMSA (Namibian Music System Administration)**- Purpose: Music royalties collection system with three panels (Artist, Company, Admin).- Tech: Frontend should be modern, responsive, stylish (black theme, logo included), built to
 consume provided REST APIs.
 ### Main Requirements
 1. **Three Panels (separate URLs)**- Artist Panel: `www.owellgraphics.com/artist`- Company Panel: `www.owellgraphics.com/company`- Admin Panel: `www.owellgraphics.com/admin`
 2. **Artist Flow**- Registration (email, password, email verification via token).- Login and profile setup (Member details form).- Upload required documents: Passport photo (image), ID document (PDF), Bank confirmation letter
 (PDF), Proof of payment (PDF).- Admin approval workflow: profile approval/rejection with notes & email notifications.- Upload music (one song at a time, track uploaded songs).- Music approval workflow (approval/rejection with notes & email notifications).- Dashboard with analytics (uploaded songs, approvals, usage stats from logsheets).- Settings: update profile, documents, reset password (token email, set new password form).
 3. **Company Flow**- Login & reset password.- Access approved music catalog (list, filter, search by ID).- Create logsheets by selecting songs.- Track usage (how many songs selected).- Dashboard with analytics of usage.
 4. **Admin Flow**- Manage approval process for profiles & music (two-step approval with notes).- Create, update, delete, view companies & admins.- Manage logsheets (view all, by ID, delete).- Access all data: users, profiles, music, licenses.- Finance: generate invoices, artist invoice reports.- Dashboard: analytics (songs usage by company, counts, etc.).- Panels for Finance, Music Approval, Profiles Approval, Licensing.
 5. **UI/UX**- Responsive (desktop, tablet, mobile).- Smart, stylish, black theme with logo.- Dashboards must be visually appealing, data-rich, and analytical.
- Artist profile page should include passport photo as profile image.
 6. **API Integration**- Use all REST endpoints from provided Postman collection.- Correct mapping: profile → profile APIs, documents → document APIs, music → music APIs,
 logsheets → logsheet APIs, finance → invoice APIs, etc.
 ### Deliverable
 A complete, functional, production-ready **frontend web app** integrated with the deployed Spring
 Boot backend.


and this is the contollers and models use them all please

This is the controllers, and model for the systems now update everything please 
Models 
package com.example.musicroyalties.models; 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
@Data 
@Entity 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "admins") 
public class Admins { 
@Id 
@GeneratedValue(strategy = GenerationType.IDENTITY) 
private Long id; 
private String name; 
private String role; 
@OneToOne 
@JoinColumn(name = "user_id") 
private User user; 
} 
package com.example.musicroyalties.models; 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "artist_upload_types") 
public class ArtistUploadType { 
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String typeName; 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
import java.time.LocalDate; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "artist_work") 
public class ArtistWork { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
 
    // 
    private String ArtistId; 
     
    @Column(nullable = false) 
    private String title; 
    private String albumName; 
    private String artist; 
    private String GroupOrBandOrStageName; 
    private String featuredArtist; 
    private String producer; 
 
    //CustomIds for works 
    @Column(unique = true) 
    private String workId; 
 
    private String Duration; 
     
    @Column(nullable = false) 
    private String fileUrl; 
     
    @Column(nullable = false) 
    private String fileType; 
    private String country; 
     
    private LocalDate uploadedDate; 
     
    @ManyToOne 
    @JoinColumn(name = "artist_upload_type_id") 
    private ArtistUploadType artistUploadType;//video or mp3 
     
    @ManyToOne 
    @JoinColumn(name = "artist_work_type_id") 
    private ArtistWorkType artistWorkType;//Pop//jazz etc 
 
 
 
 
    @ManyToOne() 
    @JoinColumn(name = "status_id") 
    private Status status; 
     
    private String ISRC_code; 
    private String notes; 
 
    @ManyToOne 
    @JoinColumn(name = "user_id", nullable = false) 
    private User user; 
 
    //Extra Details 
    private String composer; 
    private String author; 
    private String arranger; 
    private String publisher; 
    private String publishersName; 
    private String publisherAdress; 
    private String publisherTelephone; 
    private String recordedBy; 
    private String AddressOfRecordingCompany; 
    private String RecordingCompanyTelephone; 
    private String labelName; 
    private String dateRecorded; 
    //private String ipiNumber; 
 
 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "artist_work_types") 
public class ArtistWorkType { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String workTypeName;//// e.g Pop, Jazz, Gospel, etc 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
import java.time.LocalDate; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "bank_confirmation_letters") 
public class BankConfirmationLetter { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String documentTitle; 
    private String fileUrl; 
    private String fileType; 
    private LocalDate datePosted; 
     
    @OneToOne 
    @JoinColumn(name = "user_id") 
    private User user; 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "bank_names") 
public class BankName { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String bankName; 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "companies") 
public class Company { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String companyName; 
    private String companyAddress; 
    private String companyPhone; 
    private String companyEmail; 
    private String contactPerson; 
//    private String TaxNumber; 
     
    @OneToOne 
    @JoinColumn(name = "user_id") 
    private User user; 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "genders") 
public class Gender { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String genderName; 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
import java.time.LocalDate; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "id_documents") 
public class IdDocument { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String documentTitle; 
    private String fileUrl; 
    private String fileType; 
    private LocalDate datePosted; 
     
    @OneToOne 
    @JoinColumn(name = "user_id") 
    private User user; 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "licenses") 
public class LicenseBy { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String licenseName; 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
import java.time.LocalDate; 
import java.util.List; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "log_sheets") 
public class LogSheet { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String title; 
    private LocalDate createdDate; 
     
    @ManyToOne 
    @JoinColumn(name = "company_id") 
    private Company company; 
     
    @ManyToMany 
    @JoinTable( 
        name = "logsheet_music", 
        joinColumns = @JoinColumn(name = "logsheet_id"), 
        inverseJoinColumns = @JoinColumn(name = "music_id") 
    ) 
    private List<ArtistWork> selectedMusic; 
 
    @ManyToOne 
    @JoinColumn(name = "user_id", nullable = false) 
    private User user; 
 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "marital_status") 
public class MaritalStatus { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String statusName; 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "member_categories") 
public class MemberCategory { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String categoryName;//Composer, Author, Arranger 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
import java.time.LocalDate; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "member_details") 
public class MemberDetails { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
    @ManyToOne 
    @JoinColumn(name="Tittle_id") 
    private Tittle tittle; 
    @Column(nullable = false) 
    private String firstName; 
 
    //tittle 
 
     
    @Column(nullable = false) 
    private String surname; 
 
    private int idNumber; 
 
    @Column(unique = true) 
    private String ArtistId; 
     
    private String pseudonym; 
     
    @Column(nullable = false) 
    private String phoneNumber; 
     
    @Column(nullable = false) 
    private String email; 
     
    private String groupNameORStageName; 
     
    @ManyToOne 
    @JoinColumn(name = "marital_status_id") 
    private MaritalStatus maritalStatus; 
     
    @ManyToOne 
    @JoinColumn(name = "member_category_id") 
    private MemberCategory memberCategory; 
     
    private Integer noOFDependents; 
     
    private String typeOfWork; 
     
    @ManyToOne 
    @JoinColumn(name = "gender_id") 
    private Gender gender; 
    //address details 
    private String line1; 
    private String line2; 
    private String city; 
    private String region; 
    private String poBox; 
    private String postalCode; 
    private String country; 
     
    private LocalDate birthDate; 
    private String placeOfBirth; 
    private String idOrPassportNumber; 
    private String nationality; 
    private String occupation; 
    private String nameOfEmployer; 
    private String addressOfEmployer; 
     
    private String nameOfTheBand; 
    private LocalDate dateFounded; 
    private Integer numberOfBand; 
     
    @ManyToOne 
    @JoinColumn(name = "bank_name_id") 
    private BankName bankName; 
     
    private String accountHolderName; 
    private String bankAccountNumber; 
    private String bankAccountType; 
    private String bankBranchName; 
    private String bankBranchNumber; 
     
    @OneToOne 
    @JoinColumn(name = "user_id") 
    private User user; 
     
    @ManyToOne 
    @JoinColumn(name = "status_id") 
    private Status status; 
     
    private String IPI_number; 
    private String notes; 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
import java.time.LocalDate; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "passport_photos") 
public class PassportPhoto { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String imageTitle; 
    private String imageUrl; 
    private String fileType; 
    private LocalDate datePosted; 
     
    @OneToOne 
    @JoinColumn(name = "user_id") 
    private User user; 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
import java.time.LocalDate; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "proof_of_payments") 
public class ProofOfPayment { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String documentTitle; 
    private String fileUrl; 
    private String fileType; 
    private LocalDate datePosted; 
     
    @OneToOne 
    @JoinColumn(name = "user_id") 
    private User user; 
} 
//THis can wait for future use 
 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
import java.time.LocalDate; 
 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Entity 
@Table(name="PublisherOrRecordingCompany") 
public class RecordingOrPublisherCompany { 
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
    private String CompanyId; 
    private String NameOfApplican; 
    private String TradingName; 
    private String CompanyRegistrationNumber; 
    private LocalDate DateOfRegistration; 
    private String TaxNumber; 
    private String VatNumber; 
    private String BusinessAddress; 
    private String PostalAddress; 
    private String TelephoneNumber; 
    private String Email; 
    private String Website; 
    private String NominatedContactPersonName; 
    private String NominatedContactPersonPhone; 
    //Directors details 
    private String DirectorsFirstName; 
    private String DirectorsLastName; 
    private String DirectorsIdNumber; 
    //Banking 
    private String BankName; 
    private int AccountNumber; 
    private String BranchName; 
    private String BranchCode; 
 
    // 
 
 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "status") 
public class Status { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    @Enumerated(EnumType.STRING) 
    private EStatus status; 
     
    public enum EStatus { 
        PENDING, APPROVED, REJECTED 
    } 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "titles") 
public class Tittle { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    private String titleName; 
} 
package com.example.musicroyalties.models; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
import org.springframework.security.core.GrantedAuthority; 
import org.springframework.security.core.authority.SimpleGrantedAuthority; 
import org.springframework.security.core.userdetails.UserDetails; 
 
import java.time.LocalDateTime; 
import java.util.Collection; 
import java.util.List; 
 
@Entity 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Table(name = "users") 
public class User implements UserDetails { 
     
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
     
    @Column(unique = true, nullable = false) 
    private String email; 
     
    @Column(nullable = false) 
    private String password; 
     
    @Enumerated(EnumType.STRING) 
    private Role role; 
     
    private boolean enabled = false; 
    private boolean emailVerified = false; 
    private String verificationToken; 
 
    // Forgot Password Models 
    private String resetPasswordToken; 
    private LocalDateTime resetPasswordTokenExpiry; // Must import 
java.time.LocalDateTime 
     
    public enum Role { 
        ARTIST, COMPANY, ADMIN, RECORDING 
    } 
 
     
    @Override 
    public Collection<? extends GrantedAuthority> getAuthorities() { 
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name())); 
    } 
     
    @Override 
    public String getUsername() { 
        return email; 
    } 
     
    @Override 
    public boolean isAccountNonExpired() { 
        return true; 
    } 
     
    @Override 
    public boolean isAccountNonLocked() { 
        return true; 
    } 
     
    @Override 
    public boolean isCredentialsNonExpired() { 
        return true; 
    } 
} 
package com.example.musicroyalties.models.invoiceAndPayments; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
import java.time.LocalDate; 
 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Entity 
@Table(name="artistinvoicesreports") 
public class ArtistInvoiceReports { 
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
 
    private String paymentId; 
 
    private String ArtistName; 
    private String ArtistPhoneNumber; 
    private String ArtistEmail; 
    private String ArtistId; 
    private String Desciption; 
    private String paymentDate; 
 
    // Company (Sender) Details 
    private String companyAddress; 
    private String companyPhone; 
    private String companyEmail; 
    private String contactPerson; 
 
    private Double totalplayed; 
    private Double UnitPrice; 
    private Double TotalEarned; 
    private Double TotalNetpaid; 
 
    //Artist Bank Account 
    private String BankName; 
    private int AccountNumber; 
    private String branchName; 
    private LocalDate datecreated; 
 
} 
// src/main/java/com/example/musicroyalties/models/invoiceAndPayments/Invoice.java 
 
package com.example.musicroyalties.models.invoiceAndPayments; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
import java.time.LocalDate; 
 
@Entity 
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Table(name = "invoices") 
public class Invoice { 
 
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
 
    // Company (Sender) Details 
    private String companyAddress; 
    private String companyPhone; 
    private String companyEmail; 
    private String contactPerson; 
 
    // Invoice Info 
    private String invoiceNumber; 
    private String invoiceDate; 
 
    // Client (Billing To) 
    private String billingToCompanyName; 
    private String billingToCompanyAddress; 
    private String billingToCompanyPhone; 
    private String billingToCompanyEmail; 
 
    // Service Details 
    private String invoiceServiceType; 
    private int totalUsed; 
    private Double unitPrice; 
    private Double totalAmount; 
    private Double totalNetAmount; 
 
    // Bank Details 
    private int accountNumber; 
    private String bankName; 
    private String branchName; 
    private LocalDate datecreated; 
} 
package com.example.musicroyalties.models.license; 
 
import com.example.musicroyalties.models.Tittle; 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Entity 
@Table(name="legalEntity") 
public class LegalEntity { 
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
    private String CompanyName; 
    private String CompanyShortName;//e.g NBC 
    private String RegistrationNumber; 
    private String VATStatus; 
    private String VATNumber; 
    //owners Contact information 
    private String OwnerFirstName; 
    private String OwnerLastName; 
    private String OwnerEmail; 
    private String OwnerPhone; 
    @ManyToOne 
    @JoinColumn(name="title_id") 
    private Tittle OwnerTitle; 
    private int NumberOfPremises; 
    private String BuildingName; 
    private String UnitNoOrShop; 
    private String Street; 
    private String Suburb; 
    private String CityOrTown; 
    private String Country; 
    private String PostalCode; 
@ManyToOne 
@JoinColumn(name="musicusage_id") 
private MusicUsageTypes musicUsageType; 
@ManyToOne 
@JoinColumn(name="sourceofmusic_id") 
private SourceOfMusic sourceOfMusic; 
} 
package com.example.musicroyalties.models.license; 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Entity 
@Table(name="musicusagetypes") 
public class MusicUsageTypes { 
@Id 
@GeneratedValue(strategy = GenerationType.IDENTITY) 
private int  id; 
private String UsageType;//e.g sport, live events, perfomance, bars etc, buses, fitness 
} 
package com.example.musicroyalties.models.license; 
import com.example.musicroyalties.models.Tittle; 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
import java.time.LocalDate; 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Entity 
@Table(name="NaturalPersonEntity") 
public class NaturalPersonEntity { 
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
    private String Surnam; 
    private String FirstName; 
    private int IdNumber; 
    @ManyToOne 
    @JoinColumn(name="tittle_id") 
    private Tittle Title; 
    private String BusinessRoleOrTittle; 
    private String Email; 
    private String Phone; 
    private String Fax; 
    //address 
    private String AddressLocation; 
    private String UnitNo; 
    private String CityOrTown; 
    private String Suburb; 
    private String Province; 
    private String Country; 
    private String PostalCode; 
    private String Street; 
    //Details of the Premises 
    private int NumberOfPremises; 
    private LocalDate CommencementDate; 
    private String TradingNameOfBusiness; 
    @ManyToOne 
    @JoinColumn(name="musicusage_id") 
    private MusicUsageTypes musicUsageType; 
 
    //source of music 
    @ManyToOne 
    @JoinColumn(name="sourceofmusic") 
    private SourceOfMusic sourceOfMusic; 
 
} 
package com.example.musicroyalties.models.license; 
 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Entity 
@Table(name="sourceofmusic") 
public class SourceOfMusic { 
@Id 
@GeneratedValue(strategy = GenerationType.IDENTITY) 
private Long id; 
private String SourceOfMusic;//e.g Radio, Pre-recorded, Tv Audio, Other 
} 
package com.example.musicroyalties.models.license; 
import jakarta.persistence.*; 
import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Entity 
@Table(name="vatstatus") 
public class VatStatus { 
@Id 
@GeneratedValue(strategy = GenerationType.IDENTITY) 
private Long id; 
private String StatusName;// e.g VAT Registered, VAT Not Registered, Registration In 
Porgress 
} 
Controllers 
package com.example.musicroyalties.controllers.invoiceControllers; 
 
import com.example.musicroyalties.models.invoiceAndPayments.Invoice; 
import com.example.musicroyalties.services.EmailService; 
import com.example.musicroyalties.services.invoicesServices.InvoiceService; 
import jakarta.validation.Valid; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.web.bind.annotation.*; 
 
import java.net.URI; 
import java.util.List; 
import java.util.Optional; 
 
@RestController 
@RequestMapping("/api/invoices") 
@CrossOrigin(origins = "*") 
@PreAuthorize("hasRole('ADMIN')") 
public class InvoiceController { 
 
    @Autowired 
    private EmailService emailService; 
    @Autowired 
    private InvoiceService invoiceService; 
 
 
    @PostMapping("/send") 
    public Invoice  sendInvoice(@Valid @RequestBody Invoice invoice, @RequestParam String 
clientEmail) throws Exception { 
        return invoiceService.send(invoice, clientEmail); 
 
    } 
 
    //get All the Invoices 
    @GetMapping("/all") 
    public List<Invoice> getAllInvoices() { 
        return invoiceService.getAllInvoices(); 
    } 
 
    //Get By Id 
    @GetMapping("/{id}") 
    public Optional<Invoice> getInvoice(@PathVariable long id) { 
        return invoiceService.getInvoice(id); 
    } 
 
} 
package com.example.musicroyalties.controllers.invoiceControllers; 
 
import com.example.musicroyalties.models.invoiceAndPayments.ArtistInvoiceReports; 
import com.example.musicroyalties.models.invoiceAndPayments.Invoice; 
import com.example.musicroyalties.services.EmailService; 
import com.example.musicroyalties.services.invoicesServices.PaymentService; 
import jakarta.validation.Valid; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RestController 
@RequestMapping("/api/artistpayments") 
public class PaymentController { 
    @Autowired 
    private PaymentService paymentService; 
    @Autowired 
    private EmailService emailService; 
 
    @PostMapping("/send") 
    public ArtistInvoiceReports sendInvoice(@Valid @RequestBody ArtistInvoiceReports 
invoice, @RequestParam String clientEmail) throws Exception { 
        return paymentService.send(invoice, clientEmail); 
 
    } 
 
    //Get All 
    @GetMapping("/all") 
    public List<ArtistInvoiceReports> getAllInvoices() { 
        return paymentService.findAll(); 
    } 
    //Get By Id 
    @GetMapping("/{id}") 
    public Optional<ArtistInvoiceReports> getInvoice(@PathVariable long id) { 
        return paymentService.findById(id); 
    } 
} 
package com.example.musicroyalties.controllers.licenseController; 
 
import com.example.musicroyalties.models.license.LegalEntity; 
import com.example.musicroyalties.services.licenseService.LegalEntityService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RestController 
@RequestMapping("/api/legalentity") 
public class LegalEntityController { 
    @Autowired 
    private LegalEntityService legalEntityService; 
 
    //post 
    @PostMapping("/post") 
    public LegalEntity createLegalEntity(@RequestBody LegalEntity legalEntity) { 
        return legalEntityService.saveLegal(legalEntity); 
    } 
 
    //get all 
    @GetMapping("/all") 
    public List<LegalEntity> getAllLegalEntities() { 
        return legalEntityService.findAll(); 
    } 
    //get by Id 
    @GetMapping("/{id}") 
    public Optional<LegalEntity> getLegalEntityById(@PathVariable Long id) { 
        return legalEntityService.findById(id); 
    } 
 
    //delete 
    @DeleteMapping("/{id}") 
    public void deleteLegalEntityById(@PathVariable Long id) { 
        legalEntityService.deleteById(id); 
    } 
} 
package com.example.musicroyalties.controllers.licenseController; 
 
import com.example.musicroyalties.models.license.MusicUsageTypes; 
import com.example.musicroyalties.services.licenseService.MusicUsageTypeService; 
import com.example.musicroyalties.services.lookupservices.ArtistUploadTypeService; 
import org.springframework.beans.factory.annotation.Autowired; 
import 
org.springframework.security.config.annotation.method.configuration.EnableReactiveMetho
 dSecurity; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RestController 
@RequestMapping("/api/usagetypes") 
public class MusicUsageController { 
    @Autowired 
    private MusicUsageTypeService  musicUsageTypeService; 
 
    @PostMapping("/post") 
    public MusicUsageTypes createnew (@RequestBody MusicUsageTypes musicUsageTypes) 
{ 
        return musicUsageTypeService.save(musicUsageTypes); 
    } 
 
    //get all 
    @GetMapping("/all") 
    public List<MusicUsageTypes> getAll() { 
        return musicUsageTypeService.findAll(); 
    } 
 
    //get  by Id 
    @GetMapping("/{if}") 
    public Optional<MusicUsageTypes>  byId(@PathVariable int id){ 
        return  musicUsageTypeService.findById(id); 
    } 
 
    @DeleteMapping("/{id}") 
    public void delete(@PathVariable int id){ 
        musicUsageTypeService.deleteById(id); 
    } 
 
    //update 
    @PutMapping("/{id}") 
    public MusicUsageTypes update(@PathVariable int id, @RequestBody MusicUsageTypes 
musicUsageTypes) { 
        musicUsageTypes.setId(id); 
        return  musicUsageTypeService.save(musicUsageTypes); 
    } 
} 
package com.example.musicroyalties.controllers.licenseController; 
 
import com.example.musicroyalties.models.license.NaturalPersonEntity; 
import com.example.musicroyalties.services.licenseService.NaturalPersonService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RestController 
@RequestMapping("/api/naturalperson") 
public class NaturalPersonController { 
    @Autowired 
    private NaturalPersonService naturalPersonService; 
 
    //post 
    @PostMapping("/post") 
    public NaturalPersonEntity createNaturalPerson(@RequestBody NaturalPersonEntity 
naturalPersonEntity) { 
        return naturalPersonService.save(naturalPersonEntity); 
    } 
 
    //get all 
   @GetMapping("/all") 
    public List<NaturalPersonEntity> getAllNaturalPerson() { 
        return naturalPersonService.findAll(); 
   } 
 
   @GetMapping("/{id}") 
    public Optional<NaturalPersonEntity> getNaturalPersonById(@PathVariable Long id) { 
        return naturalPersonService.findById(id); 
   } 
 
   //delete 
 
    @DeleteMapping("/{id}") 
    public void deleteNaturalPersonById(@PathVariable Long id) { 
        naturalPersonService.deletebyId(id); 
    } 
} 
package com.example.musicroyalties.controllers.licenseController; 
 
import com.example.musicroyalties.models.license.SourceOfMusic; 
import com.example.musicroyalties.services.licenseService.SourceOfMusicService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.security.core.parameters.P; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RestController 
@RequestMapping("/api/sourceofmusic") 
public class SourceOfMusicController { 
    @Autowired 
    private SourceOfMusicService sourceOfMusicService; 
 
    //post 
    @PostMapping("/post") 
    public SourceOfMusic save(@RequestBody SourceOfMusic sourceOfMusic) { 
        return sourceOfMusicService.postnew(sourceOfMusic); 
    } 
 
    //get All 
    @GetMapping("/all") 
    public List<SourceOfMusic> getAll() { 
        return sourceOfMusicService.findAll(); 
    } 
 
    //get By id 
    @GetMapping("/{id}") 
    public Optional<SourceOfMusic> findById(@PathVariable Long id) { 
        return sourceOfMusicService.findById(id); 
    } 
 
    //delete 
    @DeleteMapping("/{id}") 
    public void deleteById(@PathVariable Long id) { 
        sourceOfMusicService.deleteById(id); 
    } 
 
    //update 
    @PutMapping("/{id}") 
    public SourceOfMusic update(@PathVariable Long id, @RequestBody SourceOfMusic 
sourceOfMusic) { 
        sourceOfMusic.setId(id); 
        return sourceOfMusicService.update(sourceOfMusic); 
 
    } 
} 
package com.example.musicroyalties.controllers.lookupControllers; 
 
import com.example.musicroyalties.models.ArtistUploadType; 
import com.example.musicroyalties.repositories.ArtistUploadTypeRepository; 
import com.example.musicroyalties.services.lookupservices.ArtistUploadTypeService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RestController 
@CrossOrigin(origins = "*") 
@RequestMapping("/api/uploadtype") 
public class ArtistUploadTypeController { 
    @Autowired 
    private ArtistUploadTypeService art; 
 
    //posting 
    @PostMapping("/post") 
    public ArtistUploadType postUpload(@RequestBody ArtistUploadType artistUploadType) { 
        return art.postType(artistUploadType); 
 
    } 
 
    //get all 
    @GetMapping("/all") 
    public List<ArtistUploadType> getEverything() { 
        return art.getArtistUploadTypes(); 
    } 
 
    //get by Id 
    @GetMapping("/{id}") 
    public Optional<ArtistUploadType> getById(@PathVariable Long id) { 
        return art.getArtistUploadTypeById(id); 
    } 
 
    //Delete 
    @DeleteMapping("/delete/{id}") 
    public void deleteById(@PathVariable Long id) { 
        art.deleteArtistUploadTypeById(id); 
    } 
 
    //update 
   @PutMapping("/update/{id}") 
    public ArtistUploadType updateType(@PathVariable Long id, @RequestBody 
ArtistUploadType artistUploadType) { 
        artistUploadType.setId(id); 
        return art.updateUpload(artistUploadType); 
   } 
 
 
} 
package com.example.musicroyalties.controllers.lookupControllers; 
 
import com.example.musicroyalties.models.ArtistWorkType; 
import com.example.musicroyalties.services.lookupservices.ArtistUploadTypeService; 
import com.example.musicroyalties.services.lookupservices.ArtistWorkTypeService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RestController 
@CrossOrigin(origins = "*") 
@RequestMapping("/api/worktype") 
public class ArtistWorkTypeController { 
    @Autowired 
    private ArtistWorkTypeService type; 
 
    //Post maping 
    @PostMapping("/post") 
    public ArtistWorkType post(@RequestBody ArtistWorkType artistWorkType) { 
        return type.postType(artistWorkType); 
    } 
    //get All 
    @GetMapping("/all") 
    public List<ArtistWorkType> findAll() { 
        return type.getAllWorkTypes(); 
    } 
    //get By Id 
    @GetMapping("/{id}") 
    public Optional<ArtistWorkType> findById(@PathVariable Long id) { 
        return  type.findWorkType(id); 
    } 
 
    //Delete 
    @DeleteMapping("/delete/{id}") 
    public void deleteById(@PathVariable Long id) { 
        type.deleteById(id); 
    } 
 
    //update 
    @PutMapping("/update/{id}") 
    public ArtistWorkType updateType (@PathVariable Long id, @RequestBody 
ArtistWorkType artistWorkType) { 
        artistWorkType.setId(id); 
        return type.updated(artistWorkType); 
 
    } 
} 
package com.example.musicroyalties.controllers.lookupControllers; 
 
import com.example.musicroyalties.models.BankName; 
import com.example.musicroyalties.services.lookupservices.BankNameService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RestController 
@CrossOrigin(origins = "*") 
@RequestMapping("/api/bankname") 
public class BankNameController { 
    @Autowired 
    private BankNameService bankNameService; 
     
    //post 
    @PostMapping("/post") 
    public BankName createBankName(@RequestBody BankName bankName) { 
        return bankNameService.saveBankName(bankName); 
    } 
     
    //get all 
    @GetMapping("/all") 
    public List<BankName> getAllBankName() { 
        return bankNameService.findAllBankName(); 
    } 
    //Get by Id 
    @GetMapping("/{id}") 
    public Optional<BankName> findBankNameById(@PathVariable Long id) { 
        return bankNameService.findBankNameById(id); 
    } 
 
    //Delete by Id 
    @DeleteMapping("/delete/{id}") 
    public void deleteBankNameById(@PathVariable Long id) { 
        bankNameService.deleteBankNameById(id); 
    } 
    //update 
    @PutMapping("/update/{id}") 
    public BankName updateBankName(@PathVariable Long id, @RequestBody BankName 
bankName) { 
        bankName.setId(id); 
        return bankNameService.updateBankName(bankName); 
    } 
 
} 
package com.example.musicroyalties.controllers.lookupControllers; 
 
import com.example.musicroyalties.models.Gender; 
import com.example.musicroyalties.services.lookupservices.GenderService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RequestMapping("/api/gender") 
@RestController 
@CrossOrigin(origins = "*") 
public class GenderController { 
    @Autowired 
    private GenderService genderService; 
 
    //Post 
    @PostMapping("/post") 
    public Gender postGender(@RequestBody Gender gender) { 
        return genderService.postgrnder(gender); 
    } 
 
    //get all 
    @GetMapping("/all") 
    public List<Gender> getAllGenders() { 
        return genderService.getAll(); 
    } 
 
    //get by Id 
    @GetMapping("/{id}") 
    public Optional<Gender> getGender(@PathVariable Long id) { 
        return genderService.getGender(id); 
    } 
 
    //Deleting 
    @DeleteMapping("/delete/{id}") 
    public void deleteGender(@PathVariable Long id) { 
         genderService.deleteM(id); 
    } 
 
    //Update 
    @PutMapping("/update/{id}") 
    public Gender updateGender(@PathVariable Long id, @RequestBody Gender gender) { 
        return genderService.updateGender(gender); 
    } 
 
} 
package com.example.musicroyalties.controllers.lookupControllers; 
 
import com.example.musicroyalties.models.MaritalStatus; 
import com.example.musicroyalties.services.lookupservices.MaritalService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RequestMapping("/api/martial") 
@RestController 
@CrossOrigin(origins = "*") 
public class MaritalController { 
    @Autowired 
    private MaritalService  maritalService; 
 
    //Post 
    @PostMapping("/post") 
    public MaritalStatus createM(@RequestBody MaritalStatus maritalStatus) { 
        return maritalService.saveM(maritalStatus); 
    } 
 
    //get All 
    @GetMapping("/all") 
    public List<MaritalStatus> getthemALL() { 
 
        return maritalService.getAllM(); 
    } 
 
    //get by id 
    @GetMapping("/{id}") 
    public Optional<MaritalStatus> getM(@PathVariable Long id) { 
        return maritalService.getM(id); 
    } 
 
    //Delete 
    @DeleteMapping("/delete/{id}") 
    public void deleteM(@PathVariable Long id) { 
        maritalService.deleteM(id); 
    } 
 
    //update 
    @PutMapping("/update/{id}") 
    public MaritalStatus updateM(@RequestBody MaritalStatus maritalStatus, Long id) { 
        maritalStatus.setId(id); 
        return maritalService.updateM(maritalStatus); 
    } 
} 
package com.example.musicroyalties.controllers.lookupControllers; 
 
import com.example.musicroyalties.models.MemberCategory; 
import com.example.musicroyalties.services.lookupservices.MemberService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RestController 
@RequestMapping("/api/members") 
@CrossOrigin(origins = "*") 
public class MemberController { 
    @Autowired 
    private MemberService memberService; 
 
    //Post 
    @PostMapping("/post") 
    public MemberCategory  createM(@RequestBody MemberCategory memberCategory) { 
        return memberService.saveMember(memberCategory); 
    } 
    //Get All 
    @GetMapping("/{id}") 
    public Optional<MemberCategory> findById(@PathVariable Long id){ 
        return memberService.findById(id); 
    } 
    //Get All 
    @GetMapping("/all") 
    public List<MemberCategory> findAll(){ 
        return memberService.findByCate(); 
    } 
 
    @DeleteMapping("/delete/{id}") 
    public void deleteM(@PathVariable Long id){ 
        memberService.deleteById(id); 
    } 
 
    @PutMapping("/update/{id}") 
    public MemberCategory updateM(@PathVariable Long id, @RequestBody 
MemberCategory memberCategory){ 
        memberCategory.setId(id); 
        return memberService.saveMember(memberCategory); 
    } 
} 
package com.example.musicroyalties.controllers.lookupControllers; 
 
import com.example.musicroyalties.models.Tittle; 
import com.example.musicroyalties.services.lookupservices.TitleService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Optional; 
 
@RestController 
@RequestMapping("/api/tittle") 
@CrossOrigin(origins = "*") 
public class TittleController { 
    @Autowired 
    private TitleService titleService; 
 
    //post 
    @PostMapping("/post") 
    public Tittle saveTittle(@RequestBody Tittle tittle) { 
        return titleService.savePost(tittle); 
    } 
    //get all 
    @GetMapping("/all") 
    public List<Tittle> findAllTittles() { 
        return titleService.getTittle(); 
    } 
    //get by ID 
    @GetMapping("/{id}") 
    public Optional<Tittle> findTittleById(Long id) { 
        return titleService.getTittleById(id); 
    } 
 
    //delete 
    @DeleteMapping("/delete/{id}") 
    public void deleteTittle(@PathVariable Long id) { 
         titleService.delete(id); 
    } 
 
    //update 
    @PutMapping("/update/{id}") 
    public Tittle updateTittle(@PathVariable Long id, @RequestBody Tittle tittle) { 
        tittle.setId(id); 
        return titleService.updatePost(tittle); 
    } 
} 
package com.example.musicroyalties.controllers; 
 
import com.example.musicroyalties.models.*; 
import com.example.musicroyalties.services.*; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.HttpStatus; 
import org.springframework.http.ResponseEntity; 
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.HashMap; 
import java.util.List; 
import java.util.Map; 
import java.util.Optional; 
 
@RestController 
@RequestMapping("/api/admin") 
@CrossOrigin(origins = "*") 
@PreAuthorize("hasRole('ADMIN')") 
public class AdminController { 
     
    @Autowired 
    private AdminService adminService; 
     
    @Autowired 
    private MemberDetailsService memberDetailsService; 
     
    @Autowired 
    private CompanyService companyService; 
 
    @Autowired 
    private PassportPhotoService  passportPhotoService; 
 
    @Autowired 
    private UserService userService; 
 
    @Autowired 
    private IdDocumentService idDocumentService; 
 
    @Autowired 
    private BankConfirmationLetterService bankConfirmationLetterService; 
 
    @Autowired 
    private ProofOfPaymentService proofOfPaymentService; 
    @Autowired 
    private MusicService musicService; 
    @Autowired 
    private AdminsService adminsService; 
     
    @GetMapping("/pending-profiles") 
    public ResponseEntity<?> getPendingProfiles() { 
        try { 
            return ResponseEntity.ok(memberDetailsService.getPendingMemberDetails()); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to get pending profiles: " + 
e.getMessage()); 
        } 
    } 
     
    @PostMapping("/profile/approve/{memberId}") 
    public ResponseEntity<?> approveProfile(@PathVariable Long memberId, @RequestBody 
Map<String, String> request) { 
        try { 
            String ipiNumber = request.get("ipiNumber"); 
            MemberDetails approvedProfile = 
memberDetailsService.approveMemberDetails(memberId, ipiNumber); 
            return ResponseEntity.ok(approvedProfile); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Profile approval failed: " + 
e.getMessage()); 
        } 
    } 
     
    @PostMapping("/profile/reject/{memberId}") 
    public ResponseEntity<?> rejectProfile(@PathVariable Long memberId, @RequestBody 
Map<String, String> request) { 
        try { 
            String notes = request.get("notes"); 
            MemberDetails rejectedProfile = 
memberDetailsService.rejectMemberDetails(memberId, notes); 
            return ResponseEntity.ok(rejectedProfile); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Profile rejection failed: " + 
e.getMessage()); 
        } 
    } 
     
    @GetMapping("/pending-music") 
    public ResponseEntity<?> getPendingMusic() { 
        try { 
            return ResponseEntity.ok(adminService.getPendingMusic()); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to get pending music: " + 
e.getMessage()); 
        } 
    } 
     
    @PostMapping("/music/approve/{musicId}") 
    public ResponseEntity<?> approveMusic(@PathVariable Long musicId, @RequestBody 
Map<String, String> request) { 
        try { 
            String isrcCode = request.get("isrcCode"); 
            ArtistWork approvedMusic = adminService.approveMusic(musicId, isrcCode); 
            return ResponseEntity.ok(approvedMusic); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Music approval failed: " + e.getMessage()); 
        } 
    } 
     
    @PostMapping("/music/reject/{musicId}") 
    public ResponseEntity<?> rejectMusic(@PathVariable Long musicId, @RequestBody 
Map<String, String> request) { 
        try { 
            String notes = request.get("notes"); 
            ArtistWork rejectedMusic = adminService.rejectMusic(musicId, notes); 
            return ResponseEntity.ok(rejectedMusic); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Music rejection failed: " + 
e.getMessage()); 
        } 
    } 
     
    @PostMapping("/company/create") 
    public ResponseEntity<?> createCompany(@RequestBody Map<String, String> request) { 
        try { 
            String email = request.get("email"); 
            String password = request.get("password"); 
            String companyName = request.get("companyName"); 
            String companyAddress = request.get("companyAddress"); 
            String companyPhone = request.get("companyPhone"); 
            String contactPerson = request.get("contactPerson"); 
            String companyEmail = request.get("companyEmail"); 
             
            User user = adminService.createCompanyUser(email, password, companyName, 
companyAddress, companyPhone, contactPerson, companyEmail); 
             
            // Create company details 
            Company company = new Company(); 
            company.setCompanyName(companyName); 
            company.setCompanyAddress(companyAddress); 
            company.setCompanyPhone(companyPhone); 
            company.setCompanyEmail(email); 
            company.setContactPerson(contactPerson); 
            company.setCompanyEmail(companyEmail); 
            company.setUser(user); 
             
            Company savedCompany = companyService.createCompany(company, user); 
             
            Map<String, Object> response = new HashMap<>(); 
            response.put("message", "Company created successfully"); 
            response.put("company", savedCompany); 
            response.put("user", user); 
             
            return ResponseEntity.ok(response); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Company creation failed: " + 
e.getMessage()); 
        } 
    } 
 
    //update the Company 
    @PutMapping("/company/update/{id}") 
    public ResponseEntity<?> updateCompany(@PathVariable Long id, @RequestBody 
Map<String, String> request) { 
        try { 
            // Extract fields to update 
            String companyName = request.get("companyName"); 
            String companyAddress = request.get("companyAddress"); 
            String companyPhone = request.get("companyPhone"); 
            String contactPerson = request.get("contactPerson"); 
            String companyEmail = request.get("companyEmail"); 
 
            // Build a company object with the new values 
            Company companyDetails = new Company(); 
            companyDetails.setCompanyName(companyName); 
            companyDetails.setCompanyAddress(companyAddress); 
            companyDetails.setCompanyPhone(companyPhone); 
            companyDetails.setContactPerson(contactPerson); 
            companyDetails.setCompanyEmail(companyEmail); 
 
            // Call service update 
            Company updatedCompany = companyService.updateCompany(id, companyDetails); 
 
            Map<String, Object> response = new HashMap<>(); 
            response.put("message", "Company updated successfully"); 
            response.put("company", updatedCompany); 
 
            return ResponseEntity.ok(response); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Company update failed: " + 
e.getMessage()); 
        } 
    } 
 
    // Company Update 
 
 
 
    @GetMapping("/users") 
    public ResponseEntity<?> getAllUsers() { 
        try { 
            return ResponseEntity.ok(adminService.getAllUsers()); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to get users: " + e.getMessage()); 
        } 
    } 
     
    @GetMapping("/users/{id}") 
    public ResponseEntity<?> getUserById(@PathVariable Long id) { 
        try { 
            return ResponseEntity.ok(adminService.getUserById(id)); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to get user: " + e.getMessage()); 
        } 
    } 
     
    @PutMapping("/users/{id}") 
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User 
userDetails) { 
        try { 
            User updatedUser = adminService.updateUser(id, userDetails); 
            return ResponseEntity.ok(updatedUser); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("User update failed: " + e.getMessage()); 
        } 
    } 
     
    @DeleteMapping("/users/{id}") 
    public ResponseEntity<?> deleteUser(@PathVariable Long id) { 
        try { 
            adminService.deleteUser(id); 
            return ResponseEntity.ok("User deleted successfully"); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("User deletion failed: " + e.getMessage()); 
        } 
    } 
     
    @GetMapping("/companies") 
    public ResponseEntity<?> getAllCompanies() { 
        try { 
            return ResponseEntity.ok(companyService.getAllCompanies()); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to get companies: " + 
e.getMessage()); 
        } 
    } 
    //Get Profiles 
    @GetMapping("/getprofilebyid/{id}") 
    public Optional<MemberDetails> getProfileById(@PathVariable Long id) { 
        return memberDetailsService.getMemberDetailsById(id); 
    } 
 
    @GetMapping("/getallprofiles") 
    public List<MemberDetails> getAllProfiles() { 
        return memberDetailsService.getAllMemberDetails(); 
    } 
 
 
 
    //get Users Documents By users 
    @GetMapping("/userdocumentsandprofiles/{userId}") 
    public ResponseEntity<?> getUserDocuments(@PathVariable Long userId) { 
        try { 
            Map<String, Object> documents = new HashMap<>(); 
            documents.put("passportphoto", 
passportPhotoService.getByUserId(userId).orElse(null)); 
            documents.put("proofOfPayment", 
proofOfPaymentService.getByUserId(userId).orElse(null)); 
            documents.put("idDocument", idDocumentService.getByUserId(userId).orElse(null)); 
            documents.put("bankConfirmationLetter", 
bankConfirmationLetterService.getByUserId(userId).orElse(null)); 
            
documents.put("memberDetails",memberDetailsService.getByUserId(userId).orElse(null)); 
            return ResponseEntity.ok(documents); 
 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Error fetching documents for userId " + 
userId + ": " + e.getMessage()); 
        } 
    } 
 
    //get Users Musics by users 
    @GetMapping("/usermusic/{userId}") 
    public ResponseEntity<?> getMusicByUserId(@PathVariable Long userId) { 
        try { 
            // Service method should return a list 
            List<ArtistWork> musicList = musicService.getMusicByUserId(userId); 
 
            return ResponseEntity.ok(musicList); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Error fetching music for userId " + userId + 
": " + e.getMessage()); 
        } 
    } 
 
    //get all music in the system 
    @GetMapping("/getllmusic") 
    public List<ArtistWork> getllmusic() { 
        return musicService.ListOfMusic(); 
    } 
 
    //get all companies 
    @GetMapping("/getllcompanies") 
    public List<Company> getllcompanies() { 
        return companyService.getAllCompanies(); 
    } 
 
    //get Companies by Id 
    @GetMapping("/getcompaniesbyid/{id}") 
    public Optional<Company> getCompaniesById(@PathVariable Long id) { 
        return companyService.getCompanyById(id); 
    } 
 
    //delete Company 
    @DeleteMapping("/deletecompany/{id}") 
    public void deleteCompany(@PathVariable Long id) { 
        companyService.deleteCompany(id); 
    } 
 
    //creating admins 
    @PostMapping("/admins/create") 
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> request) { 
        try { 
            String email = request.get("email"); 
            String password = request.get("password"); 
            String name = request.get("name"); 
            String role = request.get("role"); 
 
            // Create user 
            User user = userService.createAdmin(email, password); 
 
            // Create admin details 
            Admins admins = new Admins(); 
            admins.setName(name); 
            admins.setRole(role); 
            admins.setUser(user); 
 
            Admins savedAdmin = adminsService.post(admins, user); 
 
            Map<String, Object> response = new HashMap<>(); 
            response.put("message", "Admin created successfully"); 
            response.put("admin", savedAdmin); 
            response.put("user", user); 
 
            return ResponseEntity.ok(response); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Admin creation failed: " + 
e.getMessage()); 
        } 
    } 
 
    // Update Admin 
    @PutMapping("/admins/update/{id}") 
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody 
Map<String, String> request) { 
        try { 
            String name = request.get("name"); 
            String role = request.get("role"); 
 
            Admins admins = new Admins(); 
            admins.setName(name); 
            admins.setRole(role); 
 
            Admins updatedAdmin = adminsService.updateAdminById(admins, id); 
 
            Map<String, Object> response = new HashMap<>(); 
            response.put("message", "Admin updated successfully"); 
            response.put("admin", updatedAdmin); 
 
            return ResponseEntity.ok(response); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Admin update failed: " + e.getMessage()); 
        } 
    } 
 
    // Get all Admins 
    @GetMapping("/admins/all") 
    public ResponseEntity<?> getAllAdmins() { 
        try { 
            List<Admins> adminsList = adminsService.getAdmins(); 
            return ResponseEntity.ok(adminsList); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to fetch admins: " + 
e.getMessage()); 
        } 
    } 
 
    // Get Admin by ID 
    @GetMapping("/admins/{id}") 
    public ResponseEntity<?> getAdminById(@PathVariable Long id) { 
        try { 
            return adminsService.getAdminById(id) 
                    .map(ResponseEntity::ok) 
                    .orElse(ResponseEntity.notFound().build()); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to fetch admin: " + e.getMessage()); 
        } 
    } 
 
    // Delete Admin 
    @DeleteMapping("/admins/delete/{id}") 
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) { 
        try { 
            adminsService.deleteAdminById(id); 
            return ResponseEntity.ok("Admin deleted successfully"); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Admin deletion failed: " + 
e.getMessage()); 
        } 
    } 
 
    @GetMapping("/getallsheets") 
    public List<LogSheet> getAllLogSheets() { 
        return companyService.getAllLogSheets(); 
    } 
 
    @GetMapping("/logsheet/{id}") 
    public ResponseEntity<?> getLogSheetById(@PathVariable Long id) { 
        try { 
            return ResponseEntity.ok(companyService.getLogSheetById(id)); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to get logsheet: " + e.getMessage()); 
        } 
    } 
 
    @DeleteMapping("/logsheet/{id}") 
    public ResponseEntity<?> deleteLogSheet(@PathVariable Long id) { 
        try { 
            companyService.deleteLogSheet(id); 
            return ResponseEntity.ok("LogSheet deleted successfully"); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("LogSheet deletion failed: " + 
e.getMessage()); 
        } 
    } 
 
    //get Logsheet By Users 
    @GetMapping("/logsheetbyuser/{userId}") 
    public ResponseEntity<?> getLogSheetByUserId(@PathVariable Long userId) { 
        try { 
            // Service method should return a list 
            List<LogSheet> logsheet = companyService.getLogSheetByUser(userId); 
 
            return ResponseEntity.ok(logsheet); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Error " + userId + ": " + e.getMessage()); 
        } 
    } 
} 
 
package com.example.musicroyalties.controllers; 
 
import com.example.musicroyalties.models.*; 
import com.example.musicroyalties.services.*; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.security.core.annotation.AuthenticationPrincipal; 
import org.springframework.security.core.userdetails.UserDetails; 
import org.springframework.web.bind.annotation.*; 
import org.springframework.web.multipart.MultipartFile; 
 
import java.time.LocalDate; 
import java.util.HashMap; 
import java.util.List; 
import java.util.Map; 
import java.util.Optional; 
 
@RestController 
@RequestMapping("/api/artist") 
@CrossOrigin(origins = "*") 
public class ArtistController { 
     
    @Autowired 
    private MemberDetailsService memberDetailsService; 
     
    @Autowired 
    private PassportPhotoService passportPhotoService; 
     
    @Autowired 
    private ProofOfPaymentService proofOfPaymentService; 
     
    @Autowired 
    private BankConfirmationLetterService bankConfirmationLetterService; 
     
    @Autowired 
    private IdDocumentService idDocumentService; 
     
    @Autowired 
    private MusicService musicService; 
    @Autowired 
    private UserService userService; 
     
    @PostMapping("/profile") 
    public ResponseEntity<?> createProfile(@RequestBody MemberDetails memberDetails,  
                                         @AuthenticationPrincipal UserDetails userDetails) { 
        try { 
            User user = (User) userDetails; 
            MemberDetails savedProfile = 
memberDetailsService.createMemberDetails(memberDetails, user); 
            return ResponseEntity.ok(savedProfile); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Profile creation failed: " + e.getMessage()); 
        } 
    } 
     
    @GetMapping("/profile") 
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) { 
        try { 
            User user = (User) userDetails; 
            MemberDetails profile = memberDetailsService.getMemberDetailsByUser(user); 
            return ResponseEntity.ok(profile); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Profile retrieval failed: " + 
e.getMessage()); 
        } 
    } 
    //if this does not work than I will use @AuthenticationPrincipal, But this is for Admin 
    @PutMapping("/profile/{id}") 
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody 
MemberDetails memberDetails) { 
        try { 
            MemberDetails updatedProfile = memberDetailsService.updateMemberDetails(id, 
memberDetails); 
            return ResponseEntity.ok(updatedProfile); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Profile update failed: " + e.getMessage()); 
        } 
    } 
 
    //Updating for Users, why am i not using /profile/{id} 
    @PutMapping("/profile") 
    public ResponseEntity<?> updateMyProfile(@RequestBody MemberDetails 
memberDetails, 
                                             @AuthenticationPrincipal UserDetails userDetails) { 
        try { 
            User user = (User) userDetails; 
 
            // Fetch the current profile of the authenticated user 
            MemberDetails existingProfile = 
memberDetailsService.getMemberDetailsByUser(user); 
 
            // Update the existing profile with the new data 
            MemberDetails updatedProfile = 
memberDetailsService.updateMemberDetails(existingProfile.getId(), memberDetails); 
 
            return ResponseEntity.ok(updatedProfile); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Profile update failed: " + e.getMessage()); 
        } 
    } 
 
 
    @PostMapping("/passport-photo") 
    public ResponseEntity<?> uploadPassportPhoto(@RequestParam MultipartFile file, 
                                               @RequestParam String imageTitle, 
                                               @AuthenticationPrincipal UserDetails userDetails) { 
        try { 
            User user = (User) userDetails; 
            PassportPhoto photo = passportPhotoService.postPhoto(file, imageTitle, user); 
            return ResponseEntity.ok(photo); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Passport photo upload failed: " + 
e.getMessage()); 
        } 
    } 
     
    @PostMapping("/proof-of-payment") 
    public ResponseEntity<?> uploadProofOfPayment(@RequestParam MultipartFile file, 
                                                 @RequestParam String documentTitle, 
                                                 @AuthenticationPrincipal UserDetails userDetails) { 
        try { 
            User user = (User) userDetails; 
            ProofOfPayment document = proofOfPaymentService.uploadDocument(file, 
documentTitle, user); 
            return ResponseEntity.ok(document); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Proof of payment upload failed: " + 
e.getMessage()); 
        } 
    } 
     
    @PostMapping("/bank-confirmation-letter") 
    public ResponseEntity<?> uploadBankConfirmationLetter(@RequestParam MultipartFile 
file, 
                                                         @RequestParam String documentTitle, 
                                                         @AuthenticationPrincipal UserDetails userDetails) { 
        try { 
            User user = (User) userDetails; 
            BankConfirmationLetter document = 
bankConfirmationLetterService.uploadDocument(file, documentTitle, user); 
            return ResponseEntity.ok(document); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Bank confirmation letter upload failed: " + 
e.getMessage()); 
        } 
    } 
     
    @PostMapping("/id-document") 
    public ResponseEntity<?> uploadIdDocument(@RequestParam MultipartFile file, 
                                             @RequestParam String documentTitle, 
                                             @AuthenticationPrincipal UserDetails userDetails) { 
        try { 
            User user = (User) userDetails; 
            IdDocument document = idDocumentService.uploadDocument(file, documentTitle, 
user); 
            return ResponseEntity.ok(document); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("ID document upload failed: " + 
e.getMessage()); 
        } 
    } 
     
    @PostMapping("/music/upload") 
    public ResponseEntity<?> uploadMusic(@RequestParam MultipartFile file, 
@RequestParam String title, @AuthenticationPrincipal UserDetails userDetails, 
@RequestParam String ArtistId, 
                                         @RequestParam String albumName, 
                                         @RequestParam String artist, 
                                         @RequestParam String GroupOrBandOrStageName, 
                                         @RequestParam String featuredArtist, 
                                         @RequestParam String producer, 
                                         @RequestParam String country, 
                                         //@RequestParam LocalDate uploadedDate, 
                                         @RequestParam Long artistUploadTypeId, 
                                         @RequestParam Long artistWorkTypeId, 
                                         @RequestParam String Duration, 
                                         @RequestParam String composer, 
                                         @RequestParam String author, 
                                         @RequestParam String arranger, 
                                         @RequestParam String publisher, 
                                         @RequestParam String publishersName, 
                                         @RequestParam String publisherAdress, 
                                         @RequestParam String publisherTelephone, 
                                         @RequestParam String recordedBy, 
                                         @RequestParam String AddressOfRecordingCompany, 
                                         @RequestParam String labelName, 
                                         @RequestParam String dateRecorded) { 
        try { 
            User user = (User) userDetails; 
            ArtistWork music = musicService.uploadMusic(file, title, user, ArtistId, albumName, 
artist, GroupOrBandOrStageName, featuredArtist, producer,country, artistUploadTypeId, 
artistWorkTypeId, Duration, composer, author, arranger, publisher, publishersName, 
publisherAdress,publisherTelephone,recordedBy, AddressOfRecordingCompany, labelName, 
dateRecorded ); 
            return ResponseEntity.ok(music); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Music upload failed: " + e.getMessage()); 
        } 
    } 
    //for users 
    @GetMapping("/music") 
    public ResponseEntity<?> getMyMusic(@AuthenticationPrincipal UserDetails userDetails) 
{ 
        try { 
            User user = (User) userDetails; 
            return ResponseEntity.ok(musicService.getMusicByUser(user)); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Music retrieval failed: " + e.getMessage()); 
        } 
    } 
    //most used by admin 
    //if this does not work than I might remove aunthentication or not to get users 
documents, where admin or user 
    @GetMapping("/documentsandprofile") 
    public ResponseEntity<?> getMyDocuments(@AuthenticationPrincipal UserDetails 
userDetails) { 
        try { 
            User user = (User) userDetails; 
            Map<String, Object> documents = new HashMap<>(); 
             
            // Get all document types for the user 
            documents.put("passportPhoto", passportPhotoService.getByUserId(user.getId())); 
            documents.put("proofOfPayment", 
proofOfPaymentService.getByUserId(user.getId())); 
            documents.put("bankConfirmationLetter", 
bankConfirmationLetterService.getByUserId(user.getId())); 
            documents.put("idDocument", idDocumentService.getByUserId(user.getId())); 
            //recently added to get profile for user 
            documents.put("memberDetails",memberDetailsService.getByUserId(user.getId())); 
             
            return ResponseEntity.ok(documents); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Documents retrieval failed: " + 
e.getMessage()); 
        } 
    } 
 
    //the rest of the Controllers more like for Admin 
    //Get All members 
    @GetMapping("/all") 
    public List<MemberDetails> getAllMembers(){ 
        return memberDetailsService.getAllMemberDetails(); 
    } 
 
    //Get Members by id 
    @GetMapping("/{id}") 
    public Optional<MemberDetails> getMemberDetails(@PathVariable Long id){ 
        return memberDetailsService.getMemberDetailsById(id); 
    } 
 
    //Delete 
    @DeleteMapping("/delete/{id}") 
    public void deleteMemberDetails(@PathVariable Long id){ 
        memberDetailsService.deleteMemberDetailsById(id); 
    } 
 
  //get Users by emails 
    @GetMapping("/getartist") 
    public ResponseEntity<?> getArtist(@AuthenticationPrincipal UserDetails userDetails) { 
        try { 
            User user = (User) userDetails; 
            return ResponseEntity.ok(userService.getUserByEmail(user.getEmail())); 
        } catch (Exception e) { 
            throw new RuntimeException(e); 
        } 
    } 
 
 
 
 
 
} 
package com.example.musicroyalties.controllers; 
 
import com.example.musicroyalties.models.User; 
import com.example.musicroyalties.services.JwtService; 
import com.example.musicroyalties.services.UserService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.security.authentication.AuthenticationManager; 
import 
org.springframework.security.authentication.UsernamePasswordAuthenticationToken; 
import org.springframework.security.core.Authentication; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.HashMap; 
import java.util.Map; 
 
@RestController 
@RequestMapping("/api/auth") 
@CrossOrigin(origins = "*") 
public class AuthController { 
     
    @Autowired 
    private UserService userService; 
     
    @Autowired 
    private JwtService jwtService; 
     
    @Autowired 
    private AuthenticationManager authenticationManager; 
     
    @PostMapping("/register/artist") 
    public ResponseEntity<?> registerArtist(@RequestBody Map<String, String> request) { 
        try { 
            String email = request.get("email"); 
            String password = request.get("password"); 
             
            User user = userService.createArtist(email, password); 
             
            Map<String, Object> response = new HashMap<>(); 
            response.put("message", "Artist registered successfully. Please check your email for 
verification."); 
            response.put("userId", user.getId()); 
             
            return ResponseEntity.ok(response); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage()); 
        } 
    } 
     
    @PostMapping("/register/company") 
    public ResponseEntity<?> registerCompany(@RequestBody Map<String, String> request) { 
        try { 
            String email = request.get("email"); 
            String password = request.get("password"); 
             
            User user = userService.createCompany(email, password); 
             
            Map<String, Object> response = new HashMap<>(); 
            response.put("message", "Company registered successfully."); 
            response.put("userId", user.getId()); 
             
            return ResponseEntity.ok(response); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage()); 
        } 
    } 
     
    @PostMapping("/login") 
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) { 
        try { 
            String email = request.get("email"); 
            String password = request.get("password"); 
             
            Authentication authentication = authenticationManager.authenticate( 
                new UsernamePasswordAuthenticationToken(email, password) 
            ); 
             
            User user = (User) authentication.getPrincipal(); 
            String token = jwtService.generateToken(user); 
             
            Map<String, Object> response = new HashMap<>(); 
            response.put("token", token); 
            response.put("user", user); 
            response.put("message", "Login successful"); 
             
            return ResponseEntity.ok(response); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Login failed: " + e.getMessage()); 
        } 
    } 
    // 
//    @GetMapping("/verify") 
//    public ResponseEntity<?> verifyEmail(@RequestParam String token) { 
//        try { 
//            boolean verified = userService.verifyEmail(token); 
//            if (verified) { 
//                return ResponseEntity.ok("Email verified successfully. You can now login."); 
//            } else { 
//                return ResponseEntity.badRequest().body("Email verification failed."); 
//            } 
//        } catch (Exception e) { 
//            return ResponseEntity.badRequest().body("Verification failed: " + e.getMessage()); 
//        } 
//    } 
 
    //end point for the very 
    @GetMapping("/verify") 
    public ResponseEntity<?> verifyEmail(@RequestParam String token) { 
        try { 
            boolean verified = userService.verifyEmail(token); 
            if (verified) { 
                String loginUrl = "http://localhost:8080/api/auth/login"; // replace this 
                String logoUrl = "https://ytnafrica.ggff.net/images/ytnlogo.png"; 
 
                String htmlResponse = 
                        "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; 
padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px; background-color: #f9f7ff;'>" + 
                                "<div style='text-align: center; padding-bottom: 20px; border-bottom: 2px 
solid #9b6de8;'>" + 
                                "<img src='" + logoUrl + "' alt='YTN Africa Logo' style='height: 60px; object
fit: contain;' />" + 
                                "</div>" + 
 
                                "<div style='padding: 30px; color: #444; line-height: 1.6;'>" + 
                                "<h2 style='color: #6a0dad; margin-top: 0;'>Email Verified 
Successfully</h2>" + 
                                "<p style='font-size: 16px; color: #333;'>Your email has been verified 
successfully. You can now login to your account.</p>" + 
 
                                "<div style='text-align: center; margin: 30px 0;'>" + 
                                "<a href='" + loginUrl + "' " + 
                                "style='background-color: #8a2be2; color: white; padding: 14px 28px; text
decoration: none; font-size: 16px; border-radius: 6px; display: inline-block; font-weight: 
bold;'>" + 
                                "Click to Login" + 
                                "</a>" + 
                                "</div>" + 
 
                                "<p style='font-size: 14px; color: #666;'>If the button doesn't work, copy 
and paste the following link into your browser:</p>" + 
                                "<p style='font-size: 14px; word-break: break-all; color: #8a2be2;'>" + 
loginUrl + "</p>" + 
                                "</div>" + 
 
                                "<div style='text-align: center; padding-top: 20px; border-top: 1px solid 
#eaeaea; color: #999; font-size: 13px;'>" + 
                                "<p>&copy; 2025 Music Royalties System. All rights reserved.</p>" + 
                                "<p>For support, contact us at <a href='mailto:support@ytnafrica.com' 
style='color: #8a2be2; text-decoration: none;'>support@ytnafrica.com</a></p>" + 
                                "</div>" + 
                                "</div>"; 
 
                return ResponseEntity.ok() 
                        .header("Content-Type", "text/html") 
                        .body(htmlResponse); 
            } else { 
                return ResponseEntity.badRequest().body("Email verification failed."); 
            } 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Verification failed: " + e.getMessage()); 
        } 
    } 
 
 
    //endpoint for forgot password 
    @PostMapping("/forgot-password") 
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) { 
        try { 
            String email = request.get("email"); 
            userService.initiatePasswordReset(email); 
            return ResponseEntity.ok("Password reset link has been sent to your email."); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Error: " + e.getMessage()); 
        } 
    } 
 
    //endpoint for reset password 
    @PostMapping("/reset-password") 
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) { 
        try { 
            String token = request.get("token"); 
            String newPassword = request.get("newPassword"); 
            userService.resetPassword(token, newPassword); 
            return ResponseEntity.ok("Password has been reset successfully."); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Error: " + e.getMessage()); 
        } 
    } 
 
 
} 
package com.example.musicroyalties.controllers; 
 
import com.example.musicroyalties.models.*; 
import com.example.musicroyalties.services.*; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.security.core.annotation.AuthenticationPrincipal; 
import org.springframework.security.core.userdetails.UserDetails; 
import org.springframework.web.bind.annotation.*; 
 
import java.util.List; 
import java.util.Map; 
import java.util.Optional; 
import java.util.stream.Collectors; 
 
@RestController 
@RequestMapping("/api/company") 
@CrossOrigin(origins = "*") 
@PreAuthorize("hasRole('COMPANY')") 
public class CompanyController { 
     
    @Autowired 
    private CompanyService companyService; 
     
    @GetMapping("/profile") 
    public ResponseEntity<?> getCompanyProfile(@AuthenticationPrincipal UserDetails 
userDetails) { 
        try { 
            User user = (User) userDetails; 
            Company company = companyService.getCompanyByUser(user); 
            return ResponseEntity.ok(company); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to get company profile: " + 
e.getMessage()); 
        } 
    } 
     
    @PutMapping("/profile/{id}") 
    public ResponseEntity<?> updateCompanyProfile(@PathVariable Long id, @RequestBody 
Company companyDetails) { 
        try { 
            Company updatedCompany = companyService.updateCompany(id, companyDetails); 
            return ResponseEntity.ok(updatedCompany); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Company profile update failed: " + 
e.getMessage()); 
        } 
    } 
     
    @GetMapping("/approved-music") 
    public ResponseEntity<?> getApprovedMusic() { 
        try { 
            return ResponseEntity.ok(companyService.getApprovedMusic()); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to get approved music: " + 
e.getMessage()); 
        } 
    } 
     
//    @PostMapping("/logsheet") 
//    public ResponseEntity<?> createLogSheet(@RequestBody Map<String, Object> request, 
//                                          @AuthenticationPrincipal UserDetails userDetails) { 
//        try { 
//            String title = (String) request.get("title"); 
// 
//            List<Long> musicIds = (List<Long>) request.get("musicIds"); 
// 
//            User user = (User) userDetails; 
//            LogSheet logSheet = companyService.createLogSheet(title, user, musicIds); 
//            return ResponseEntity.ok(logSheet); 
//        } catch (Exception e) { 
//            return ResponseEntity.badRequest().body("LogSheet creation failed: " + 
e.getMessage()); 
//        } 
//    } 
 
    //create Logsheet 
    @PostMapping("/logsheet") 
    public ResponseEntity<?> createLogSheet(@RequestBody Map<String, Object> request, 
                                            @AuthenticationPrincipal UserDetails userDetails) { 
        try { 
            String title = (String) request.get("title"); 
 
            // Safely convert the list 
            @SuppressWarnings("unchecked") 
            List<Integer> musicIdsRaw = (List<Integer>) request.get("musicIds"); 
 
            List<Long> musicIds = musicIdsRaw.stream() 
                    .map(Integer::longValue) 
                    .toList(); 
 
            User user = (User) userDetails; 
 
            LogSheet logSheet = companyService.createLogSheet(title, user, musicIds); 
            return ResponseEntity.ok(logSheet); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("LogSheet creation failed: " + 
e.getMessage()); 
        } 
    } 
 
 
    @GetMapping("/logsheets") 
    public ResponseEntity<?> getLogSheets(@AuthenticationPrincipal UserDetails userDetails) 
{ 
        try { 
            User user = (User) userDetails; 
            return ResponseEntity.ok(companyService.getLogSheetsByCompany(user)); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to get logsheets: " + 
e.getMessage()); 
        } 
    } 
    // 
    @GetMapping("/logsheet/{id}") 
    public ResponseEntity<?> getLogSheetById(@PathVariable Long id) { 
        try { 
            return ResponseEntity.ok(companyService.getLogSheetById(id)); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("Failed to get logsheet: " + e.getMessage()); 
        } 
    } 
    //get All Logsheets for admins 
    @GetMapping("/getallsheets") 
    public List<LogSheet> getAllLogSheets() { 
        return companyService.getAllLogSheets(); 
    } 
 
//    @PutMapping("/logsheet/{id}") 
//    public ResponseEntity<?> updateLogSheet(@PathVariable Long id, @RequestBody 
Map<String, Object> request) { 
//        try { 
//            String title = (String) request.get("title"); 
//            @SuppressWarnings("unchecked") 
//            List<Long> musicIds = (List<Long>) request.get("musicIds"); 
// 
//            LogSheet updatedLogSheet = companyService.updateLogSheet(id, title, musicIds); 
//            return ResponseEntity.ok(updatedLogSheet); 
//        } catch (Exception e) { 
//            return ResponseEntity.badRequest().body("LogSheet update failed: " + 
e.getMessage()); 
//        } 
//    } 
    //put mapping new 
//@PutMapping("/logsheet/{id}") 
//public ResponseEntity<?> updateLogSheet(@PathVariable Long id, @RequestBody 
Map<String, Object> request) { 
//    try { 
//        
String title = (String) request.get("title"); 
// 
//        
//        
//        
// 
//        
//                
//                
// 
//        
//        
// Convert Integers to Longs 
@SuppressWarnings("unchecked") 
List<Integer> musicIdsRaw = (List<Integer>) request.get("musicIds"); 
List<Long> musicIds = musicIdsRaw.stream() 
.map(Integer::longValue) 
.toList(); 
LogSheet updatedLogSheet = companyService.updateLogSheet(id, title, musicIds); 
return ResponseEntity.ok(updatedLogSheet); 
//    } catch (Exception e) { 
//        
return ResponseEntity.badRequest().body("LogSheet update failed: " + 
e.getMessage()); 
//    } 
//} 
//    //newly updated 
//    @PutMapping("/logsheet/{id}") 
//    public ResponseEntity<?> updateLogSheet(@PathVariable Long id, 
//                                            
@RequestBody Map<String, Object> request, 
//                                            
//        
//            
// 
//            
//            
//            
// 
//            
//                    
//                    
// 
//            
//            
// 
//            
@AuthenticationPrincipal UserDetails userDetails) { 
try { 
String title = (String) request.get("title"); 
// Convert safely 
@SuppressWarnings("unchecked") 
List<Integer> musicIdsRaw = (List<Integer>) request.get("musicIds"); 
List<Long> musicIds = musicIdsRaw.stream() 
.map(Integer::longValue) 
.toList(); 
// Get authenticated user 
User user = (User) userDetails; 
// Fetch the logsheet and ensure it belongs to the same company 
//            LogSheet logSheet = companyService.getLogSheetById(id) 
//                    .orElseThrow(() -> new RuntimeException("LogSheet not found with id: " + id)); 
// 
//            Company company = companyService.getCompanyByUser(user); 
//            if (!logSheet.getCompany().getId().equals(company.getId())) { 
//                return ResponseEntity.status(403).body("You are not allowed to update this 
logsheet"); 
//            } 
// 
//            // Perform update 
//            LogSheet updatedLogSheet = companyService.updateLogSheet(id, title, musicIds); 
//            return ResponseEntity.ok(updatedLogSheet); 
//        } catch (Exception e) { 
//            e.printStackTrace(); 
//            return ResponseEntity.badRequest().body("LogSheet update failed: " + 
e.getMessage()); 
//        } 
//    } 
 
    @PutMapping("/logsheet/{id}") 
    public ResponseEntity<?> updateLogSheet(@PathVariable Long id, 
                                            @RequestBody Map<String, Object> request, 
                                            @AuthenticationPrincipal UserDetails userDetails) { 
        try { 
            String title = (String) request.get("title"); 
 
            @SuppressWarnings("unchecked") 
            List<Integer> musicIdsRaw = (List<Integer>) request.get("musicIds"); 
 
            List<Long> musicIds = musicIdsRaw.stream() 
                    .map(Integer::longValue) 
                    .collect(Collectors.toList()); //    mutable list 
 
            User user = (User) userDetails; 
 
            //     Ensure the logsheet belongs to the authenticated user’s company 
            LogSheet logSheet = companyService.getLogSheetById(id) 
                    .orElseThrow(() -> new RuntimeException("LogSheet not found with id: " + id)); 
 
            Company company = companyService.getCompanyByUser(user); 
            if (!logSheet.getCompany().getId().equals(company.getId())) { 
                return ResponseEntity.status(403).body("You are not allowed to update this 
logsheet"); 
            } 
 
            LogSheet updatedLogSheet = companyService.updateLogSheet(id, title, musicIds); 
            return ResponseEntity.ok(updatedLogSheet); 
        } catch (Exception e) { 
            e.printStackTrace(); 
            return ResponseEntity.badRequest().body("LogSheet update failed: " + 
e.getMessage()); 
        } 
    } 
 
 
 
    @DeleteMapping("/logsheet/{id}") 
    public ResponseEntity<?> deleteLogSheet(@PathVariable Long id) { 
        try { 
            companyService.deleteLogSheet(id); 
            return ResponseEntity.ok("LogSheet deleted successfully"); 
        } catch (Exception e) { 
            return ResponseEntity.badRequest().body("LogSheet deletion failed: " + 
e.getMessage()); 
        } 
    } 
    //Get Company By Id 
    @GetMapping("/getcompanybyid/{id}") 
    public Optional<Company> getCompanyById(@PathVariable Long id) { 
        return companyService.getCompanyById(id); 
    } 
    //Delete Company 
    @DeleteMapping("/delete/{id}") 
    public void deleteCompanyById(@PathVariable Long id) { 
         companyService.deleteCompany(id); 
    } 
} 
package com.example.musicroyalties.controllers; 
 
import com.example.musicroyalties.services.*; 
import jakarta.servlet.http.HttpServletRequest; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.core.io.Resource; 
import org.springframework.http.HttpHeaders; 
import org.springframework.http.MediaType; 
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.*; 
 
@RestController 
@CrossOrigin(origins = "*") 
public class FileViewController { 
     
    @Autowired 
    private PassportPhotoService passportPhotoService; 
     
    @Autowired 
    private ProofOfPaymentService proofOfPaymentService; 
     
    @Autowired 
    private BankConfirmationLetterService bankConfirmationLetterService; 
     
    @Autowired 
    private IdDocumentService idDocumentService; 
     
    @Autowired 
    private MusicService musicService; 
     
    // Passport Photo View 
    //new Passport view 
    @GetMapping("/api/passportphoto/view/{fileName:.+}") 
    public ResponseEntity<Resource> viewPassportPhoto(@PathVariable String fileName, 
HttpServletRequest request) { 
        try { 
            Resource resource = passportPhotoService.loadFileAsResource(fileName); 
 
            // Detect content type (PNG, JPEG, etc.) 
            String contentType = 
request.getServletContext().getMimeType(resource.getFile().getAbsolutePath()); 
            if (contentType == null) { 
                contentType = "application/octet-stream"; // fallback 
            } 
 
            return ResponseEntity.ok() 
                    .contentType(MediaType.parseMediaType(contentType)) 
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + 
resource.getFilename() + "\"") 
                    .body(resource); 
 
        } catch (Exception e) { 
            return ResponseEntity.notFound().build(); 
        } 
    } 
 
 
    // Proof of Payment View 
    @GetMapping("/api/proofofpayment/view/{fileName:.+}") 
    public ResponseEntity<Resource> viewProofOfPayment(@PathVariable String fileName, 
                                                       HttpServletRequest request) { 
        try { 
            Resource resource = proofOfPaymentService.loadFileAsResource(fileName); 
 
            // Detect file content type (image/jpeg, image/png, application/pdf, etc.) 
            String contentType = request.getServletContext() 
                    .getMimeType(resource.getFile().getAbsolutePath()); 
            if (contentType == null) { 
                contentType = "application/octet-stream"; // fallback 
            } 
 
            return ResponseEntity.ok() 
                    .contentType(MediaType.parseMediaType(contentType)) 
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "inline; filename=\"" + resource.getFilename() + "\"") 
                    .body(resource); 
 
        } catch (Exception e) { 
            return ResponseEntity.notFound().build(); 
        } 
    } 
 
 
    //New Bank Comfirmation letter View 
    @GetMapping("/api/bankconfirmationletter/view/{fileName:.+}") 
    public ResponseEntity<Resource> viewBankConfirmationLetter(@PathVariable String 
fileName, 
                                                               HttpServletRequest request) { 
        try { 
            Resource resource = bankConfirmationLetterService.loadFileAsResource(fileName); 
 
            // Detect file content type 
            String contentType = request.getServletContext() 
                    .getMimeType(resource.getFile().getAbsolutePath()); 
            if (contentType == null) { 
                contentType = "application/octet-stream"; // fallback 
            } 
 
            return ResponseEntity.ok() 
                    .contentType(MediaType.parseMediaType(contentType)) 
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "inline; filename=\"" + resource.getFilename() + "\"") 
                    .body(resource); 
 
        } catch (Exception e) { 
            return ResponseEntity.notFound().build(); 
        } 
    } 
 
    // ID Document View 
    @GetMapping("/api/iddocument/view/{fileName:.+}") 
    public ResponseEntity<Resource> viewIdDocument(@PathVariable String fileName, 
                                                   HttpServletRequest request) { 
        try { 
            Resource resource = idDocumentService.loadFileAsResource(fileName); 
 
            // Detect file content type 
            String contentType = request.getServletContext() 
                    .getMimeType(resource.getFile().getAbsolutePath()); 
            if (contentType == null) { 
                contentType = "application/octet-stream"; // fallback 
            } 
 
            return ResponseEntity.ok() 
                    .contentType(MediaType.parseMediaType(contentType)) 
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "inline; filename=\"" + resource.getFilename() + "\"") 
                    .body(resource); 
 
        } catch (Exception e) { 
            return ResponseEntity.notFound().build(); 
        } 
    } 
 
 
 
 
//    // Music File View 
//    @GetMapping("/api/music/view/{fileName:.+}") 
//    public ResponseEntity<Resource> viewMusicFile(@PathVariable String fileName) { 
//        try { 
//            Resource resource = musicService.loadFileAsResource(fileName); 
//            return ResponseEntity.ok() 
//                    .header("Content-Disposition", "inline; filename=\"" + resource.getFilename() + 
"\"") 
//                    .body(resource); 
//        } catch (Exception e) { 
//            return ResponseEntity.notFound().build(); 
//        } 
//    } 
 
    // Music File View 
    @GetMapping("/api/music/view/{fileName:.+}") 
    public ResponseEntity<Resource> viewMusicFile(@PathVariable String fileName, 
                                                  HttpServletRequest request) { 
        try { 
            Resource resource = musicService.loadFileAsResource(fileName); 
 
            // Detect file content type 
            String contentType = request.getServletContext() 
                    .getMimeType(resource.getFile().getAbsolutePath()); 
            if (contentType == null) { 
                contentType = "application/octet-stream"; // fallback 
            } 
 
            return ResponseEntity.ok() 
                    .contentType(MediaType.parseMediaType(contentType)) 
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "inline; filename=\"" + resource.getFilename() + "\"") 
                    .body(resource); 
 
        } catch (Exception e) { 
            return ResponseEntity.notFound().build(); 
        } 
    } 
 
 
    // Music Download 
//    @GetMapping("/api/music/download/{id}") 
//    public ResponseEntity<?> downloadMusic(@PathVariable Long id) { 
//        try { 
//            return musicService.downloadMusic(id); 
//        } catch (Exception e) { 
//            return ResponseEntity.badRequest().body("Download failed: " + e.getMessage()); 
//        } 
//    } 
    // Music Download 
//    @GetMapping("/api/music/download/{fileName:.+}") 
//    public ResponseEntity<Resource> downloadMusic(@PathVariable String fileName, 
//                                                  HttpServletRequest request) { 
//        try { 
//            Resource resource = musicService.loadFileAsResource(fileName); 
// 
//            // Detect MIME type 
//            String contentType = request.getServletContext() 
//                    .getMimeType(resource.getFile().getAbsolutePath()); 
//            if (contentType == null) { 
//                contentType = "application/octet-stream"; 
//            } 
// 
//            return ResponseEntity.ok() 
//                    .contentType(MediaType.parseMediaType(contentType)) 
//                    .header(HttpHeaders.CONTENT_DISPOSITION, 
//                            "attachment; filename=\"" + resource.getFilename() + "\"") 
//                    .body(resource); 
// 
//        } catch (Exception e) { 
//            return ResponseEntity.notFound().build(); 
//        } 
//    } 
 
    //forcely Download 
    @GetMapping("/api/music/download/{fileName:.+}") 
    public ResponseEntity<Resource> downloadMusic(@PathVariable String fileName, 
                                                  HttpServletRequest request) { 
        try { 
            // Load file as resource 
            Resource resource = musicService.loadFileAsResource(fileName); 
 
            if (resource == null || !resource.exists()) { 
                return ResponseEntity.notFound().build(); 
            } 
 
            // Detect MIME type 
            String contentType = request.getServletContext() 
                    .getMimeType(resource.getFile().getAbsolutePath()); 
 
            if (contentType == null) { 
                contentType = "application/octet-stream"; 
            } 
 
            return ResponseEntity.ok() 
                    .contentType(MediaType.parseMediaType(contentType)) 
                    // Force download with the original filename 
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + resource.getFilename() + "\"") 
                    .body(resource); 
 
        } catch (Exception e) { 
            return ResponseEntity.internalServerError().build(); 
        } 
    } 
 
 
 
 
 
 
 
 
    //downloading endpoints, Use this end points 
    // Passport Photo Download 
    @GetMapping("/api/passportphoto/download/{fileName:.+}") 
    public ResponseEntity<Resource> downloadPassportPhoto(@PathVariable String 
fileName, 
                                                          HttpServletRequest request) { 
        try { 
            Resource resource = passportPhotoService.loadFileAsResource(fileName); 
 
            // Detect MIME type 
            String contentType = 
request.getServletContext().getMimeType(resource.getFile().getAbsolutePath()); 
            if (contentType == null) { 
                contentType = "application/octet-stream"; 
            } 
 
            return ResponseEntity.ok() 
                    .contentType(MediaType.parseMediaType(contentType)) 
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + resource.getFilename() + "\"") 
                    .body(resource); 
 
        } catch (Exception e) { 
            return ResponseEntity.notFound().build(); 
        } 
    } 
 
    // Proof of Payment Download 
    @GetMapping("/api/proofofpayment/download/{fileName:.+}") 
    public ResponseEntity<Resource> downloadProofOfPayment(@PathVariable String 
fileName, 
                                                           HttpServletRequest request) { 
        try { 
            Resource resource = proofOfPaymentService.loadFileAsResource(fileName); 
 
            String contentType = 
request.getServletContext().getMimeType(resource.getFile().getAbsolutePath()); 
            if (contentType == null) { 
                contentType = "application/octet-stream"; 
            } 
 
            return ResponseEntity.ok() 
                    .contentType(MediaType.parseMediaType(contentType)) 
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + resource.getFilename() + "\"") 
                    .body(resource); 
 
        } catch (Exception e) { 
            return ResponseEntity.notFound().build(); 
        } 
    } 
 
    // Bank Confirmation Letter Download 
    @GetMapping("/api/bankconfirmationletter/download/{fileName:.+}") 
    public ResponseEntity<Resource> downloadBankConfirmationLetter(@PathVariable String 
fileName, 
                                                                   HttpServletRequest request) { 
        try { 
            Resource resource = bankConfirmationLetterService.loadFileAsResource(fileName); 
 
            String contentType = 
request.getServletContext().getMimeType(resource.getFile().getAbsolutePath()); 
            if (contentType == null) { 
                contentType = "application/octet-stream"; 
            } 
 
            return ResponseEntity.ok() 
                    .contentType(MediaType.parseMediaType(contentType)) 
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + resource.getFilename() + "\"") 
                    .body(resource); 
 
        } catch (Exception e) { 
            return ResponseEntity.notFound().build(); 
        } 
    } 
 
    // ID Document Download 
    @GetMapping("/api/iddocument/download/{fileName:.+}") 
    public ResponseEntity<Resource> downloadIdDocument(@PathVariable String fileName, 
                                                       HttpServletRequest request) { 
        try { 
            Resource resource = idDocumentService.loadFileAsResource(fileName); 
 
            String contentType = 
request.getServletContext().getMimeType(resource.getFile().getAbsolutePath()); 
            if (contentType == null) { 
                contentType = "application/octet-stream"; 
            } 
 
            return ResponseEntity.ok() 
                    .contentType(MediaType.parseMediaType(contentType)) 
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + resource.getFilename() + "\"") 
                    .body(resource); 
 
        } catch (Exception e) { 
            return ResponseEntity.notFound().build(); 
        } 
    } 
} 
 
 
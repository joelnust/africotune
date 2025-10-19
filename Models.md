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
}package com.example.musicroyalties.models.license;

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
    private String StatusName;// e.g VAT Registered, VAT Not Registered, Registration In Porgress

}
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
    private LocalDateTime resetPasswordTokenExpiry; // Must import java.time.LocalDateTime
    
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

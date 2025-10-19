Read the instructions below and process everything please.
1.	Artist Panel

1.1 This is how I want the profile creating flow. In the My profile tab or section. When creating profile instead of having a create profile button replace it  and put next page, on the next page I must upload all the documents and than click submit profile.
Than after submitted show that the profile was submitted, it must show in a form of a table with few details and than in that table have a Action column with action(View profile, Edit profile), also the table must have Status column for the profile if it was Approved or rejected.
This is Controller file.

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
            MemberDetails savedProfile = memberDetailsService.createMemberDetails(memberDetails, user);
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
            return ResponseEntity.badRequest().body("Profile retrieval failed: " + e.getMessage());
        }
    }
    //if this does not work than I will use @AuthenticationPrincipal, But this is for Admin
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody MemberDetails memberDetails) {
        try {
            MemberDetails updatedProfile = memberDetailsService.updateMemberDetails(id, memberDetails);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Profile update failed: " + e.getMessage());
        }
    }

    //Updating for Users, why am i not using /profile/{id}
    @PutMapping("/profile")
    public ResponseEntity<?> updateMyProfile(@RequestBody MemberDetails memberDetails,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;

            // Fetch the current profile of the authenticated user
            MemberDetails existingProfile = memberDetailsService.getMemberDetailsByUser(user);

            // Update the existing profile with the new data
            MemberDetails updatedProfile = memberDetailsService.updateMemberDetails(existingProfile.getId(), memberDetails);

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
            return ResponseEntity.badRequest().body("Passport photo upload failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/proof-of-payment")
    public ResponseEntity<?> uploadProofOfPayment(@RequestParam MultipartFile file,
                                                 @RequestParam String documentTitle,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            ProofOfPayment document = proofOfPaymentService.uploadDocument(file, documentTitle, user);
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Proof of payment upload failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/bank-confirmation-letter")
    public ResponseEntity<?> uploadBankConfirmationLetter(@RequestParam MultipartFile file,
                                                         @RequestParam String documentTitle,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            BankConfirmationLetter document = bankConfirmationLetterService.uploadDocument(file, documentTitle, user);
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Bank confirmation letter upload failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/id-document")
    public ResponseEntity<?> uploadIdDocument(@RequestParam MultipartFile file,
                                             @RequestParam String documentTitle,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            IdDocument document = idDocumentService.uploadDocument(file, documentTitle, user);
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("ID document upload failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/music/upload")
    public ResponseEntity<?> uploadMusic(@RequestParam MultipartFile file, @RequestParam String title, @AuthenticationPrincipal UserDetails userDetails, @RequestParam String ArtistId,
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
            ArtistWork music = musicService.uploadMusic(file, title, user, ArtistId, albumName, artist, GroupOrBandOrStageName, featuredArtist, producer,country, artistUploadTypeId, artistWorkTypeId, Duration, composer, author, arranger, publisher, publishersName, publisherAdress,publisherTelephone,recordedBy, AddressOfRecordingCompany, labelName, dateRecorded );
            return ResponseEntity.ok(music);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Music upload failed: " + e.getMessage());
        }
    }
    //for users
    @GetMapping("/music")
    public ResponseEntity<?> getMyMusic(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            return ResponseEntity.ok(musicService.getMusicByUser(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Music retrieval failed: " + e.getMessage());
        }
    }
    //most used by admin
    //if this does not work than I might remove aunthentication or not to get users documents, where admin or user
    @GetMapping("/documentsandprofile")
    public ResponseEntity<?> getMyDocuments(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            Map<String, Object> documents = new HashMap<>();
            
            // Get all document types for the user
            documents.put("passportPhoto", passportPhotoService.getByUserId(user.getId()));
            documents.put("proofOfPayment", proofOfPaymentService.getByUserId(user.getId()));
            documents.put("bankConfirmationLetter", bankConfirmationLetterService.getByUserId(user.getId()));
            documents.put("idDocument", idDocumentService.getByUserId(user.getId()));
            //recently added to get profile for user
            documents.put("memberDetails",memberDetailsService.getByUserId(user.getId()));
            
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Documents retrieval failed: " + e.getMessage());
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

a)	When Action is View Profile, I must pull the form and view the profile 
@GetMapping("/profile")
public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
      And new page I must view the Documents with endpoint 
@GetMapping("/documentsandprofile")
public ResponseEntity<?> getMyDocuments(@AuthenticationPrincipal UserDetails userDetails) {
b)	When action is Edit profile 
Use APIS here 
package com.example.musicroyalties.controllers.update;

import com.example.musicroyalties.models.*;
import com.example.musicroyalties.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/artist2/")
@CrossOrigin(origins = "*")

public class ArtistOtherController {
    @Autowired
    private PassportPhotoService passportPhotoService;
    @Autowired
    private IdDocumentService idDocumentService;
    @Autowired
    private BankConfirmationLetterService bankConfirm;
    @Autowired
    private ProofOfPaymentService proofOfPaymentService;
    @Autowired
    private MusicService musicService;

    //This Part is for Admin Use only if neccesary
    //delete for passport
    @DeleteMapping("/deletephoto/{id}")
    public void deleteById(@PathVariable("id") Long id) throws Exception {
        passportPhotoService.delete(id);
    }

    //Update for passport
    @PutMapping("/updatephoto/{id}")
    public PassportPhoto updae(@RequestParam("file") MultipartFile file, @RequestParam("id") Long id, @RequestParam("imageTitle") String imageTitle) throws Exception {
        return passportPhotoService.updatePhoto(id, file, imageTitle);
    }

    //delete for id docs
    @DeleteMapping("/deleteid/{id}")
    public void deleteIdById(@PathVariable("id") Long id) throws Exception {
        idDocumentService.delete(id);
    }

    //update Documents
    @PutMapping("/updateid/{id}")
    public IdDocument updateid(@RequestParam("file") MultipartFile file, @RequestParam("id") Long id, @RequestParam("documentTitle") String documentTitle) throws Exception {
        return idDocumentService.updateDocument(id, file, documentTitle);
    }

    //delete bank Comfimation Letter
    @DeleteMapping("/deletebankconfirm/{id}")
    public void deleteBankConfirm(@PathVariable("id") Long id) throws Exception {
        bankConfirm.delete(id);
    }

    //update Bank Confirm letter
    @PutMapping("/updatebankconfirm/{id}")
    public BankConfirmationLetter updateb(@RequestParam("file") MultipartFile file, @RequestParam("id") Long id, @RequestParam("documentTitle") String documentTitle) throws Exception {
        return bankConfirm.updateDocument(id, file, documentTitle);
    }

    //Delete for ProofOfpayment
    @DeleteMapping("/deleteProofOfpayment/{id}")
    public void deleteProofOfpayment(@RequestParam("id") Long id) throws Exception {
        proofOfPaymentService.delete(id);
    }

    // Update proof
    @PutMapping("/updateproof/{id}")
    public ProofOfPayment updateProof(@RequestParam("file") MultipartFile file, @RequestParam("id") Long id, @RequestParam("documentTitle") String documentTitle) throws Exception {
        return proofOfPaymentService.updateDocument(id, file, documentTitle);
    }

    //Music Side yet to be updated
    //Delete Music
    @DeleteMapping("/deletemusic/{id}")
    public void deleteMusic(@RequestParam("id") Long id) throws Exception {
        musicService.deleteMusic(id);
    }

    @PutMapping("/updatemusic/{id}")
    public ArtistWork updamusic(Long id,@AuthenticationPrincipal UserDetails userDetails, @RequestParam MultipartFile file, @RequestParam String title, @RequestParam String ArtistId,
                                @RequestParam String albumName,
                                @RequestParam String artist,

                                @RequestParam String GroupOrBandOrStageName,
                                @RequestParam String featuredArtist,
                                @RequestParam String producer,
                                @RequestParam String country,

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
                                @RequestParam String dateRecorded) throws Exception {
        User user = (User) userDetails;
        return musicService.updateMusic(id,file, title, ArtistId, albumName, artist, GroupOrBandOrStageName, featuredArtist, producer,country, artistUploadTypeId, artistWorkTypeId, Duration, composer, author, arranger, publisher, publishersName, publisherAdress,publisherTelephone,recordedBy, AddressOfRecordingCompany, labelName, dateRecorded );
    }
// End of the Part for the Admin Us
// This Part is for Aunthenticated users to
// Update passport photo (for authenticated user

//Logged in Users//passport
@PutMapping("/updatephotobyuser")
public ResponseEntity<?> updatePassportPhoto(@PathVariable@RequestParam("file") MultipartFile file,
                                             @RequestParam("imageTitle") String imageTitle,
                                             @AuthenticationPrincipal UserDetails userDetails) {
    try {
        User user = (User) userDetails;

        // Fetch the photo for this user
        PassportPhoto existingPhoto = passportPhotoService.getByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("You don't have a passport photo yet"));

        // Update the photo

        // PassportPhoto updatedPhoto = passportPhotoService.updatePhoto(existingPhoto.getId(), file, String.valueOf(id));
        PassportPhoto updatedPhoto = passportPhotoService.updatePhoto(existingPhoto.getId(), file, imageTitle);
        return ResponseEntity.ok(updatedPhoto);

    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Passport photo update failed: " + e.getMessage());
    }
}

    // Delete passport photo (for authenticated user)
    @DeleteMapping("/deleteuserphoto")
    public ResponseEntity<?> deletePassportPhoto(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;

            // Fetch the photo for this user
            PassportPhoto existingPhoto = passportPhotoService.getByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("You don't have a passport photo to delete"));

            // Delete the photo
            passportPhotoService.delete(existingPhoto.getId());
            return ResponseEntity.ok("Passport photo deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Passport photo deletion failed: " + e.getMessage());
        }
    }
    //update proof of payment
    @PutMapping("/updateproofofpayuser")
    public ResponseEntity<?> proofOfPay (@RequestParam("file") MultipartFile file,
                                                 @RequestParam("documentTitle") String documentTitle,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;

            // fetch proof of payment
            ProofOfPayment existingproof = proofOfPaymentService.getByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("You don't have a proof of payment"));

            // Update Proof of pay
            ProofOfPayment updatedpayment = proofOfPaymentService.updateDocument(existingproof.getId(), file, documentTitle);
            return ResponseEntity.ok(updatedpayment);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("proof of payment update failed: " + e.getMessage());
        }
    }

    //Delete the proof of payment
    @DeleteMapping("/deleteproofofpay")
    public  ResponseEntity<?> deleteProofOfPay (@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            ProofOfPayment existingproof = proofOfPaymentService.getByUserId(user.getId()).orElseThrow(() -> new  RuntimeException("You don't have a passport photo yet"));
            proofOfPaymentService.delete(existingproof.getId());
            return ResponseEntity.ok("Proof of payment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Proof of payment deletion failed: " + e.getMessage());
        }
    }

    //update Bank Comfirm letter
    @PutMapping("/updatebankletteruser")

    public ResponseEntity<?> bankconfrimletter (@RequestParam("file") MultipartFile file,
                                         @RequestParam("documentTitle") String documentTitle,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;

            // Fetch the bank comfirm letter for this user
            BankConfirmationLetter exsitingbank = bankConfirm.getByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("You don't have a proof of payment"));

            // Update the bank Comfirm
            BankConfirmationLetter updatedpayment = bankConfirm.updateDocument(exsitingbank.getId(), file, documentTitle);
            return ResponseEntity.ok(updatedpayment);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Proof of payment update failed: " + e.getMessage());
        }
    }


    //    @PutMapping("/updatebankletteruser")
//    public ResponseEntity<?> updateBankLetterUser(@RequestParam("file") MultipartFile file,@RequestParam("documentTitle") String documentTitle, @AuthenticationPrincipal UserDetails userDetails) throws Exception {
//        User user = (User) userDetails;
//        BankConfirmationLetter existingBankC = bankConfirm.getByUserId(user.getId()).orElseThrow(() -> new  RuntimeException("You don't have a passport photo yet"));
//        BankConfirmationLetter updated = bankConfirm.updateDocument(existingBankC.getId(), file, documentTitle);
//        return ResponseEntity.ok(updated);
//    }
    //Delete bank Comfirm letter
    @DeleteMapping("/deletebankletteruser")
    public  ResponseEntity<?> deleteBankLetterUser(@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        BankConfirmationLetter exsitingone = bankConfirm.getByUserId(user.getId()).orElseThrow(() -> new  RuntimeException("You don't have a passport photo yet"));
        bankConfirm.delete(exsitingone.getId());
        return ResponseEntity.ok("Bank confirmation deleted successfully");

    }

    //Update Id, not sure abiiut id
//    @PutMapping("/updatiddocbyuser")
//    public ResponseEntity<?> updateUserId (@RequestParam("file") MultipartFile file,@RequestParam("documentTitle") String documentTitle, @AuthenticationPrincipal UserDetails userDetails) throws Exception {
//        User user = (User) userDetails;
//        IdDocument existing = idDocumentService.getByUserId(user.getId()).orElseThrow(() -> new RuntimeException("You don't have a passport photo yet"));
//        IdDocument updated = idDocumentService.updateDocument(existing.getId(), file, documentTitle);
//        return ResponseEntity.ok(updated);
//    }

    //new Update for ID
    @PutMapping("/updatiddocbyuser")

    public ResponseEntity<?> udateIdDoc (@RequestParam("file") MultipartFile file,
                                                @RequestParam("documentTitle") String documentTitle,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;

            // Fetch the bank comfirm letter for this user
            IdDocument exsitingbank = idDocumentService.getByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("You don't have a ID"));

            // Update the bank Comfirm
            IdDocument updatedpayment = idDocumentService.updateDocument(exsitingbank.getId(), file, documentTitle);
            return ResponseEntity.ok(updatedpayment);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("ID update failed: " + e.getMessage());
        }
    }


    //delete
    @DeleteMapping("/deleteuseriddoc")
    public  ResponseEntity<?> deleteUserId (@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        IdDocument exist= idDocumentService.getByUserId(user.getId()).orElseThrow(() -> new RuntimeException("You don't have a passport photo yet"));
        idDocumentService.delete(exist.getId());
        return ResponseEntity.ok("Id document deleted successfully");
    }

    //end of Authenticated user, delete and update

    //get Documents individually by Authenticated users
    //get for Passport
    @GetMapping("/getpassportuser")
    public ResponseEntity<?> getPassportUser(@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        return ResponseEntity.ok(proofOfPaymentService.getByUserId(user.getId()));
    }
    //get for Id
    @GetMapping("/getiddocument")
    public ResponseEntity<?> getIdDocument(@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        return ResponseEntity.ok(idDocumentService.getByUserId(user.getId()));
    }
    //get for bank comfirm letter
    @GetMapping("/getbankletter")
    public ResponseEntity<?> getBankLetterUser(@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        return ResponseEntity.ok(bankConfirm.getByUserId(user.getId()));
    }

    //get proof of payment
    @GetMapping("/getproofofpay")
    public ResponseEntity<?> getProofOfPay(@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        return ResponseEntity.ok(proofOfPaymentService.getByUserId(user.getId()));
    }

//    //Music side
//    @PutMapping("/updatemusicbyuser/{id}")
//    public ResponseEntity<?> updatems (@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails, @RequestParam MultipartFile file, @RequestParam String title, @RequestParam String ArtistId,
//                                       @RequestParam String albumName,
//                                       @RequestParam String artist,
//                                       @RequestParam String GroupOrBandOrStageName,
//                                       @RequestParam String featuredArtist,
//                                       @RequestParam String producer,
//                                       @RequestParam String country,
//                                       //@RequestParam LocalDate uploadedDate,
//                                       @RequestParam Long artistUploadTypeId,
//                                       @RequestParam Long artistWorkTypeId,
//                                       @RequestParam String Duration,
//                                       @RequestParam String composer,
//                                       @RequestParam String author,
//                                       @RequestParam String arranger,
//                                       @RequestParam String publisher,
//                                       @RequestParam String publishersName,
//                                       @RequestParam String publisherAdress,
//                                       @RequestParam String publisherTelephone,
//                                       @RequestParam String recordedBy,
//                                       @RequestParam String AddressOfRecordingCompany,
//                                       @RequestParam String labelName,
//                                       @RequestParam String dateRecorded) {
//
//        try {
//            User user = (User) userDetails;
//            ArtistWork exist = musicService.getByUserId(user.getId()).orElseThrow(() -> new RuntimeException("You don't have a music   yet"));
//            ArtistWork musicId = musicService.getMusicById(exist.getId()).orElseThrow(() -> new RuntimeException("You don't have a music"));
//            ArtistWork update = musicService.updateMusic(exist.getId(), musicId.getId(), file, title, ArtistId, albumName, GroupOrBandOrStageName, artist, featuredArtist, producer, country, artistUploadTypeId, artistWorkTypeId, Duration, composer, author, arranger, publisher, publishersName, publisherAdress, publisherTelephone, recordedBy, AddressOfRecordingCompany, labelName, dateRecorded );
//            return ResponseEntity.ok(update);
//        }catch (Exception e) {
//            return ResponseEntity.badRequest().body("Music Update failed: " + e.getMessage());
//        }
//    }
    //New update
@PutMapping("/updatemusicbyuser/{id}")
public ResponseEntity<?> updateMusicByUser(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam MultipartFile file,
        @RequestParam String title,
        @RequestParam String ArtistId,
        @RequestParam String albumName,
        @RequestParam String artist,
        @RequestParam String GroupOrBandOrStageName,
        @RequestParam String featuredArtist,
        @RequestParam String producer,
        @RequestParam String country,
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
        // get logged in user
        User currentUser = (User) userDetails;

        // find the music by id
        ArtistWork music = musicService.getMusicById(id)
                .orElseThrow(() -> new RuntimeException("Music not found with id: " + id));

        // check ownership
        if (!music.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only update your own music");
        }

        // perform update
        ArtistWork updated = musicService.updateMusic(
                id,
                file,
                title,
                ArtistId,
                albumName,
                GroupOrBandOrStageName,
                artist,
                featuredArtist,
                producer,
                country,
                artistUploadTypeId,
                artistWorkTypeId,
                Duration,
                composer,
                author,
                arranger,
                publisher,
                publishersName,
                publisherAdress,
                publisherTelephone,
                recordedBy,
                AddressOfRecordingCompany,
                labelName,
                dateRecorded
        );

        return ResponseEntity.ok(updated);

    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Music Update failed: " + e.getMessage());
    }
}


    //delete
    @DeleteMapping("/deletemusicbyuserid/{id}")
    public ResponseEntity<?> deletemusic (@AuthenticationPrincipal UserDetails userDetails,@PathVariable Long id) throws Exception {
        User user = (User) userDetails;
        ArtistWork music = musicService.getMusicById(id)
                .orElseThrow(() -> new RuntimeException("Music not found with id: " + id));
      musicService.deleteMusic(id);
      return ResponseEntity.ok(music);

    }

}

and this 
@PutMapping("/profile/{id}")
public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody MemberDetails memberDetails) {
    try {
        MemberDetails updatedProfile = memberDetailsService.updateMemberDetails(id, memberDetails);
        return ResponseEntity.ok(updatedProfile);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Profile update failed: " + e.getMessage());
    }
}

So  when the Action is Edit Profile, pull the form submitted, first page edit the profile and next page edit the documents  use the controllers well please.

Look at the Models.md files  and controllers when it comes to viewing documents and passportphoto, put the Passport photo as the profile icon on the panel

This is the file below
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
    public ResponseEntity<Resource> viewPassportPhoto(@PathVariable String fileName, HttpServletRequest request) {
        try {
            Resource resource = passportPhotoService.loadFileAsResource(fileName);

            // Detect content type (PNG, JPEG, etc.)
            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            if (contentType == null) {
                contentType = "application/octet-stream"; // fallback
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
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
    public ResponseEntity<Resource> viewBankConfirmationLetter(@PathVariable String fileName,
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
//                    .header("Content-Disposition", "inline; filename=\"" + resource.getFilename() + "\"")
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
    public ResponseEntity<Resource> downloadPassportPhoto(@PathVariable String fileName,
                                                          HttpServletRequest request) {
        try {
            Resource resource = passportPhotoService.loadFileAsResource(fileName);

            // Detect MIME type
            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
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
    public ResponseEntity<Resource> downloadProofOfPayment(@PathVariable String fileName,
                                                           HttpServletRequest request) {
        try {
            Resource resource = proofOfPaymentService.loadFileAsResource(fileName);

            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
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
    public ResponseEntity<Resource> downloadBankConfirmationLetter(@PathVariable String fileName,
                                                                   HttpServletRequest request) {
        try {
            Resource resource = bankConfirmationLetterService.loadFileAsResource(fileName);

            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
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

            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
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


so in shot, I must tap on the tab My profile than create profile and than next page upload documents, than final button is submitted and when submitted the must be a table in a form a excel sheet with columns  with few data but mainly status of the application and actions(View Profile, Edit Profile), for viewing the profile only read only starting with the profile and next page the Documents also click view one by one. Than at the Edit profile section (Edit Profile and Edit documents  and save them). Remember on the Overview tab also Show ArtistId, look at the memberDetails model, overview of dashboard must show artistid, and IPI number as well please not just the name, use the get endpoint (@GetMapping("/profile"), 
). Also when viewing the whole Profile including the documents  you maybe use the endpoint= /api/artist/documentsandprofile, where when a user wants to view the whole profile including the documents, here is a example of the json response
{
    "passportPhoto": {
        "id": 1,
        "imageTitle": "2025",
        "imageUrl": "https://api.owellgraphics.com/api/passportphoto/view/Screenshot 2025-08-21 235353_1758624478989.png",
        "fileType": "image/png",
        "datePosted": "2025-09-23",
        "user": {
            "id": 2,
            "email": "joelkalimbwe3@gmail.com",
            "password": "$2a$10$Mo9Gb5yrbfrITWZ.iK72O.CwZR6gmYgGGcBFVZn/VACW/CXCHGvEG",
            "role": "ARTIST",
            "enabled": true,
            "emailVerified": true,
            "verificationToken": null,
            "resetPasswordToken": "9c44f567-bde0-4f3b-a8f8-cd3ce05fdd19",
            "resetPasswordTokenExpiry": "2025-09-23T08:00:07.462284",
            "username": "joelkalimbwe3@gmail.com",
            "authorities": [
                {
                    "authority": "ROLE_ARTIST"
                }
            ],
            "accountNonExpired": true,
            "accountNonLocked": true,
            "credentialsNonExpired": true
        }
    },
    "proofOfPayment": null,
    "bankConfirmationLetter": null,
    "idDocument": null,
    "memberDetails": {
        "id": 1,
        "tittle": null,
        "firstName": "Joel",
        "surname": "Kalimbwe",
        "idNumber": 34334534,
        "pseudonym": "joel",
        "phoneNumber": "0812320168",
        "email": "joelkalimbwe3@gmail.com",
        "groupNameORStageName": "qwefw",
        "maritalStatus": null,
        "memberCategory": null,
        "noOFDependents": 12,
        "typeOfWork": "jazz",
        "gender": null,
        "line1": "Kehemu Primary School, Rundu, Namibia",
        "line2": "green well",
        "city": "Rundu",
        "region": null,
        "poBox": "1123",
        "postalCode": "10000",
        "country": "Namibia",
        "birthDate": "2001-02-23",
        "placeOfBirth": "Rundu",
        "idOrPassportNumber": "132123432",
        "nationality": "Namibian",
        "occupation": "Software Enginner",
        "nameOfEmployer": "Joel Chipoa Kalimbwe",
        "addressOfEmployer": "Kehemu Primary School, Rundu, Namibia",
        "nameOfTheBand": "Joel Chipoa Kalimbwe",
        "dateFounded": "2022-09-23",
        "numberOfBand": 2,
        "bankName": null,
        "accountHolderName": "Joel",
        "bankAccountNumber": "21222",
        "bankAccountType": "cheque",
        "bankBranchName": "brunch",
        "bankBranchNumber": "32212313",
        "user": {
            "id": 2,
            "email": "joelkalimbwe3@gmail.com",
            "password": "$2a$10$Mo9Gb5yrbfrITWZ.iK72O.CwZR6gmYgGGcBFVZn/VACW/CXCHGvEG",
            "role": "ARTIST",
            "enabled": true,
            "emailVerified": true,
            "verificationToken": null,
            "resetPasswordToken": "9c44f567-bde0-4f3b-a8f8-cd3ce05fdd19",
            "resetPasswordTokenExpiry": "2025-09-23T08:00:07.462284",
            "username": "joelkalimbwe3@gmail.com",
            "authorities": [
                {
                    "authority": "ROLE_ARTIST"
                }
            ],
            "accountNonExpired": true,
            "accountNonLocked": true,
            "credentialsNonExpired": true
        },
        "status": {
            "id": 1,
            "status": "PENDING"
        },
        "notes": null,
        "artistId": "YTNKA01JO1",
        "ipi_number": null
    }
}



1.2.	  For music Upload remember to use the API  @PostMapping("/music/upload") and use the same form in the code as it it only make the fix below
 And in the My Music Tab under Action Colum have Edit Music, or Delete Music
For Edit Please retrieve the music form, edit the files except the workId, ISRC_code
Fields and and than ask the user to upload new file. I should than be able to delete music, 
The music uploaded must be in table please
package com.example.musicroyalties.controllers.update;

import com.example.musicroyalties.models.*;
import com.example.musicroyalties.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/artist2/")
@CrossOrigin(origins = "*")

public class ArtistOtherController {
    @Autowired
    private PassportPhotoService passportPhotoService;
    @Autowired
    private IdDocumentService idDocumentService;
    @Autowired
    private BankConfirmationLetterService bankConfirm;
    @Autowired
    private ProofOfPaymentService proofOfPaymentService;
    @Autowired
    private MusicService musicService;

    //This Part is for Admin Use only if neccesary
    //delete for passport
    @DeleteMapping("/deletephoto/{id}")
    public void deleteById(@PathVariable("id") Long id) throws Exception {
        passportPhotoService.delete(id);
    }

    //Update for passport
    @PutMapping("/updatephoto/{id}")
    public PassportPhoto updae(@RequestParam("file") MultipartFile file, @RequestParam("id") Long id, @RequestParam("imageTitle") String imageTitle) throws Exception {
        return passportPhotoService.updatePhoto(id, file, imageTitle);
    }

    //delete for id docs
    @DeleteMapping("/deleteid/{id}")
    public void deleteIdById(@PathVariable("id") Long id) throws Exception {
        idDocumentService.delete(id);
    }

    //update Documents
    @PutMapping("/updateid/{id}")
    public IdDocument updateid(@RequestParam("file") MultipartFile file, @RequestParam("id") Long id, @RequestParam("documentTitle") String documentTitle) throws Exception {
        return idDocumentService.updateDocument(id, file, documentTitle);
    }

    //delete bank Comfimation Letter
    @DeleteMapping("/deletebankconfirm/{id}")
    public void deleteBankConfirm(@PathVariable("id") Long id) throws Exception {
        bankConfirm.delete(id);
    }

    //update Bank Confirm letter
    @PutMapping("/updatebankconfirm/{id}")
    public BankConfirmationLetter updateb(@RequestParam("file") MultipartFile file, @RequestParam("id") Long id, @RequestParam("documentTitle") String documentTitle) throws Exception {
        return bankConfirm.updateDocument(id, file, documentTitle);
    }

    //Delete for ProofOfpayment
    @DeleteMapping("/deleteProofOfpayment/{id}")
    public void deleteProofOfpayment(@RequestParam("id") Long id) throws Exception {
        proofOfPaymentService.delete(id);
    }

    // Update proof
    @PutMapping("/updateproof/{id}")
    public ProofOfPayment updateProof(@RequestParam("file") MultipartFile file, @RequestParam("id") Long id, @RequestParam("documentTitle") String documentTitle) throws Exception {
        return proofOfPaymentService.updateDocument(id, file, documentTitle);
    }

    //Music Side yet to be updated
    //Delete Music
    @DeleteMapping("/deletemusic/{id}")
    public void deleteMusic(@RequestParam("id") Long id) throws Exception {
        musicService.deleteMusic(id);
    }

    @PutMapping("/updatemusic/{id}")
    public ArtistWork updamusic(Long id,@AuthenticationPrincipal UserDetails userDetails, @RequestParam MultipartFile file, @RequestParam String title, @RequestParam String ArtistId,
                                @RequestParam String albumName,
                                @RequestParam String artist,

                                @RequestParam String GroupOrBandOrStageName,
                                @RequestParam String featuredArtist,
                                @RequestParam String producer,
                                @RequestParam String country,

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
                                @RequestParam String dateRecorded) throws Exception {
        User user = (User) userDetails;
        return musicService.updateMusic(id,file, title, ArtistId, albumName, artist, GroupOrBandOrStageName, featuredArtist, producer,country, artistUploadTypeId, artistWorkTypeId, Duration, composer, author, arranger, publisher, publishersName, publisherAdress,publisherTelephone,recordedBy, AddressOfRecordingCompany, labelName, dateRecorded );
    }
// End of the Part for the Admin Us
// This Part is for Aunthenticated users to
// Update passport photo (for authenticated user

//Logged in Users//passport
@PutMapping("/updatephotobyuser")
public ResponseEntity<?> updatePassportPhoto(@PathVariable@RequestParam("file") MultipartFile file,
                                             @RequestParam("imageTitle") String imageTitle,
                                             @AuthenticationPrincipal UserDetails userDetails) {
    try {
        User user = (User) userDetails;

        // Fetch the photo for this user
        PassportPhoto existingPhoto = passportPhotoService.getByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("You don't have a passport photo yet"));

        // Update the photo

        // PassportPhoto updatedPhoto = passportPhotoService.updatePhoto(existingPhoto.getId(), file, String.valueOf(id));
        PassportPhoto updatedPhoto = passportPhotoService.updatePhoto(existingPhoto.getId(), file, imageTitle);
        return ResponseEntity.ok(updatedPhoto);

    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Passport photo update failed: " + e.getMessage());
    }
}

    // Delete passport photo (for authenticated user)
    @DeleteMapping("/deleteuserphoto")
    public ResponseEntity<?> deletePassportPhoto(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;

            // Fetch the photo for this user
            PassportPhoto existingPhoto = passportPhotoService.getByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("You don't have a passport photo to delete"));

            // Delete the photo
            passportPhotoService.delete(existingPhoto.getId());
            return ResponseEntity.ok("Passport photo deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Passport photo deletion failed: " + e.getMessage());
        }
    }
    //update proof of payment
    @PutMapping("/updateproofofpayuser")
    public ResponseEntity<?> proofOfPay (@RequestParam("file") MultipartFile file,
                                                 @RequestParam("documentTitle") String documentTitle,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;

            // fetch proof of payment
            ProofOfPayment existingproof = proofOfPaymentService.getByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("You don't have a proof of payment"));

            // Update Proof of pay
            ProofOfPayment updatedpayment = proofOfPaymentService.updateDocument(existingproof.getId(), file, documentTitle);
            return ResponseEntity.ok(updatedpayment);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("proof of payment update failed: " + e.getMessage());
        }
    }

    //Delete the proof of payment
    @DeleteMapping("/deleteproofofpay")
    public  ResponseEntity<?> deleteProofOfPay (@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            ProofOfPayment existingproof = proofOfPaymentService.getByUserId(user.getId()).orElseThrow(() -> new  RuntimeException("You don't have a passport photo yet"));
            proofOfPaymentService.delete(existingproof.getId());
            return ResponseEntity.ok("Proof of payment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Proof of payment deletion failed: " + e.getMessage());
        }
    }

    //update Bank Comfirm letter
    @PutMapping("/updatebankletteruser")

    public ResponseEntity<?> bankconfrimletter (@RequestParam("file") MultipartFile file,
                                         @RequestParam("documentTitle") String documentTitle,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;

            // Fetch the bank comfirm letter for this user
            BankConfirmationLetter exsitingbank = bankConfirm.getByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("You don't have a proof of payment"));

            // Update the bank Comfirm
            BankConfirmationLetter updatedpayment = bankConfirm.updateDocument(exsitingbank.getId(), file, documentTitle);
            return ResponseEntity.ok(updatedpayment);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Proof of payment update failed: " + e.getMessage());
        }
    }


    //    @PutMapping("/updatebankletteruser")
//    public ResponseEntity<?> updateBankLetterUser(@RequestParam("file") MultipartFile file,@RequestParam("documentTitle") String documentTitle, @AuthenticationPrincipal UserDetails userDetails) throws Exception {
//        User user = (User) userDetails;
//        BankConfirmationLetter existingBankC = bankConfirm.getByUserId(user.getId()).orElseThrow(() -> new  RuntimeException("You don't have a passport photo yet"));
//        BankConfirmationLetter updated = bankConfirm.updateDocument(existingBankC.getId(), file, documentTitle);
//        return ResponseEntity.ok(updated);
//    }
    //Delete bank Comfirm letter
    @DeleteMapping("/deletebankletteruser")
    public  ResponseEntity<?> deleteBankLetterUser(@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        BankConfirmationLetter exsitingone = bankConfirm.getByUserId(user.getId()).orElseThrow(() -> new  RuntimeException("You don't have a passport photo yet"));
        bankConfirm.delete(exsitingone.getId());
        return ResponseEntity.ok("Bank confirmation deleted successfully");

    }

    //Update Id, not sure abiiut id
//    @PutMapping("/updatiddocbyuser")
//    public ResponseEntity<?> updateUserId (@RequestParam("file") MultipartFile file,@RequestParam("documentTitle") String documentTitle, @AuthenticationPrincipal UserDetails userDetails) throws Exception {
//        User user = (User) userDetails;
//        IdDocument existing = idDocumentService.getByUserId(user.getId()).orElseThrow(() -> new RuntimeException("You don't have a passport photo yet"));
//        IdDocument updated = idDocumentService.updateDocument(existing.getId(), file, documentTitle);
//        return ResponseEntity.ok(updated);
//    }

    //new Update for ID
    @PutMapping("/updatiddocbyuser")

    public ResponseEntity<?> udateIdDoc (@RequestParam("file") MultipartFile file,
                                                @RequestParam("documentTitle") String documentTitle,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;

            // Fetch the bank comfirm letter for this user
            IdDocument exsitingbank = idDocumentService.getByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("You don't have a ID"));

            // Update the bank Comfirm
            IdDocument updatedpayment = idDocumentService.updateDocument(exsitingbank.getId(), file, documentTitle);
            return ResponseEntity.ok(updatedpayment);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("ID update failed: " + e.getMessage());
        }
    }


    //delete
    @DeleteMapping("/deleteuseriddoc")
    public  ResponseEntity<?> deleteUserId (@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        IdDocument exist= idDocumentService.getByUserId(user.getId()).orElseThrow(() -> new RuntimeException("You don't have a passport photo yet"));
        idDocumentService.delete(exist.getId());
        return ResponseEntity.ok("Id document deleted successfully");
    }

    //end of Authenticated user, delete and update

    //get Documents individually by Authenticated users
    //get for Passport
    @GetMapping("/getpassportuser")
    public ResponseEntity<?> getPassportUser(@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        return ResponseEntity.ok(proofOfPaymentService.getByUserId(user.getId()));
    }
    //get for Id
    @GetMapping("/getiddocument")
    public ResponseEntity<?> getIdDocument(@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        return ResponseEntity.ok(idDocumentService.getByUserId(user.getId()));
    }
    //get for bank comfirm letter
    @GetMapping("/getbankletter")
    public ResponseEntity<?> getBankLetterUser(@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        return ResponseEntity.ok(bankConfirm.getByUserId(user.getId()));
    }

    //get proof of payment
    @GetMapping("/getproofofpay")
    public ResponseEntity<?> getProofOfPay(@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = (User) userDetails;
        return ResponseEntity.ok(proofOfPaymentService.getByUserId(user.getId()));
    }

//    //Music side
//    @PutMapping("/updatemusicbyuser/{id}")
//    public ResponseEntity<?> updatems (@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails, @RequestParam MultipartFile file, @RequestParam String title, @RequestParam String ArtistId,
//                                       @RequestParam String albumName,
//                                       @RequestParam String artist,
//                                       @RequestParam String GroupOrBandOrStageName,
//                                       @RequestParam String featuredArtist,
//                                       @RequestParam String producer,
//                                       @RequestParam String country,
//                                       //@RequestParam LocalDate uploadedDate,
//                                       @RequestParam Long artistUploadTypeId,
//                                       @RequestParam Long artistWorkTypeId,
//                                       @RequestParam String Duration,
//                                       @RequestParam String composer,
//                                       @RequestParam String author,
//                                       @RequestParam String arranger,
//                                       @RequestParam String publisher,
//                                       @RequestParam String publishersName,
//                                       @RequestParam String publisherAdress,
//                                       @RequestParam String publisherTelephone,
//                                       @RequestParam String recordedBy,
//                                       @RequestParam String AddressOfRecordingCompany,
//                                       @RequestParam String labelName,
//                                       @RequestParam String dateRecorded) {
//
//        try {
//            User user = (User) userDetails;
//            ArtistWork exist = musicService.getByUserId(user.getId()).orElseThrow(() -> new RuntimeException("You don't have a music   yet"));
//            ArtistWork musicId = musicService.getMusicById(exist.getId()).orElseThrow(() -> new RuntimeException("You don't have a music"));
//            ArtistWork update = musicService.updateMusic(exist.getId(), musicId.getId(), file, title, ArtistId, albumName, GroupOrBandOrStageName, artist, featuredArtist, producer, country, artistUploadTypeId, artistWorkTypeId, Duration, composer, author, arranger, publisher, publishersName, publisherAdress, publisherTelephone, recordedBy, AddressOfRecordingCompany, labelName, dateRecorded );
//            return ResponseEntity.ok(update);
//        }catch (Exception e) {
//            return ResponseEntity.badRequest().body("Music Update failed: " + e.getMessage());
//        }
//    }
    //New update
@PutMapping("/updatemusicbyuser/{id}")
public ResponseEntity<?> updateMusicByUser(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam MultipartFile file,
        @RequestParam String title,
        @RequestParam String ArtistId,
        @RequestParam String albumName,
        @RequestParam String artist,
        @RequestParam String GroupOrBandOrStageName,
        @RequestParam String featuredArtist,
        @RequestParam String producer,
        @RequestParam String country,
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
        // get logged in user
        User currentUser = (User) userDetails;

        // find the music by id
        ArtistWork music = musicService.getMusicById(id)
                .orElseThrow(() -> new RuntimeException("Music not found with id: " + id));

        // check ownership
        if (!music.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only update your own music");
        }

        // perform update
        ArtistWork updated = musicService.updateMusic(
                id,
                file,
                title,
                ArtistId,
                albumName,
                GroupOrBandOrStageName,
                artist,
                featuredArtist,
                producer,
                country,
                artistUploadTypeId,
                artistWorkTypeId,
                Duration,
                composer,
                author,
                arranger,
                publisher,
                publishersName,
                publisherAdress,
                publisherTelephone,
                recordedBy,
                AddressOfRecordingCompany,
                labelName,
                dateRecorded
        );

        return ResponseEntity.ok(updated);

    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Music Update failed: " + e.getMessage());
    }
}


    //delete
    @DeleteMapping("/deletemusicbyuserid/{id}")
    public ResponseEntity<?> deletemusic (@AuthenticationPrincipal UserDetails userDetails,@PathVariable Long id) throws Exception {
        User user = (User) userDetails;
        ArtistWork music = musicService.getMusicById(id)
                .orElseThrow(() -> new RuntimeException("Music not found with id: " + id));
      musicService.deleteMusic(id);
      return ResponseEntity.ok(music);

    }

}

try using this @PutMapping("/updatemusicbyuser/{id}")
for update,  this for @DeleteMapping("/deletemusicbyuserid/{id}")
 for delete also the get music by user endpint /api/artist/music

1.3.	Now I what to track perfomamce on both artist panel and Admin panel
And this is how it will work, when a company creates a logsheet

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
    public ResponseEntity<?> getCompanyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            Company company = companyService.getCompanyByUser(user);
            return ResponseEntity.ok(company);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get company profile: " + e.getMessage());
        }
    }
    
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateCompanyProfile(@PathVariable Long id, @RequestBody Company companyDetails) {
        try {
            Company updatedCompany = companyService.updateCompany(id, companyDetails);
            return ResponseEntity.ok(updatedCompany);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Company profile update failed: " + e.getMessage());
        }
    }
    
    @GetMapping("/approved-music")
    public ResponseEntity<?> getApprovedMusic() {
        try {
            return ResponseEntity.ok(companyService.getApprovedMusic());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get approved music: " + e.getMessage());
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
//            return ResponseEntity.badRequest().body("LogSheet creation failed: " + e.getMessage());
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
            return ResponseEntity.badRequest().body("LogSheet creation failed: " + e.getMessage());
        }
    }


    @GetMapping("/logsheets")
    public ResponseEntity<?> getLogSheets(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            return ResponseEntity.ok(companyService.getLogSheetsByCompany(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get logsheets: " + e.getMessage());
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
//    public ResponseEntity<?> updateLogSheet(@PathVariable Long id, @RequestBody Map<String, Object> request) {
//        try {
//            String title = (String) request.get("title");
//            @SuppressWarnings("unchecked")
//            List<Long> musicIds = (List<Long>) request.get("musicIds");
//
//            LogSheet updatedLogSheet = companyService.updateLogSheet(id, title, musicIds);
//            return ResponseEntity.ok(updatedLogSheet);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("LogSheet update failed: " + e.getMessage());
//        }
//    }
    //put mapping new
//@PutMapping("/logsheet/{id}")
//public ResponseEntity<?> updateLogSheet(@PathVariable Long id, @RequestBody Map<String, Object> request) {
//    try {
//        String title = (String) request.get("title");
//
//        // Convert Integers to Longs
//        @SuppressWarnings("unchecked")
//        List<Integer> musicIdsRaw = (List<Integer>) request.get("musicIds");
//
//        List<Long> musicIds = musicIdsRaw.stream()
//                .map(Integer::longValue)
//                .toList();
//
//        LogSheet updatedLogSheet = companyService.updateLogSheet(id, title, musicIds);
//        return ResponseEntity.ok(updatedLogSheet);
//    } catch (Exception e) {
//        return ResponseEntity.badRequest().body("LogSheet update failed: " + e.getMessage());
//    }
//}

//    //newly updated
//    @PutMapping("/logsheet/{id}")
//    public ResponseEntity<?> updateLogSheet(@PathVariable Long id,
//                                            @RequestBody Map<String, Object> request,
//                                            @AuthenticationPrincipal UserDetails userDetails) {
//        try {
//            String title = (String) request.get("title");
//
//            // Convert safely
//            @SuppressWarnings("unchecked")
//            List<Integer> musicIdsRaw = (List<Integer>) request.get("musicIds");
//
//            List<Long> musicIds = musicIdsRaw.stream()
//                    .map(Integer::longValue)
//                    .toList();
//
//            // Get authenticated user
//            User user = (User) userDetails;
//
//            // Fetch the logsheet and ensure it belongs to the same company
//            LogSheet logSheet = companyService.getLogSheetById(id)
//                    .orElseThrow(() -> new RuntimeException("LogSheet not found with id: " + id));
//
//            Company company = companyService.getCompanyByUser(user);
//            if (!logSheet.getCompany().getId().equals(company.getId())) {
//                return ResponseEntity.status(403).body("You are not allowed to update this logsheet");
//            }
//
//            // Perform update
//            LogSheet updatedLogSheet = companyService.updateLogSheet(id, title, musicIds);
//            return ResponseEntity.ok(updatedLogSheet);
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.badRequest().body("LogSheet update failed: " + e.getMessage());
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
                    .collect(Collectors.toList()); // ✅ mutable list

            User user = (User) userDetails;

            // 🔒 Ensure the logsheet belongs to the authenticated user’s company
            LogSheet logSheet = companyService.getLogSheetById(id)
                    .orElseThrow(() -> new RuntimeException("LogSheet not found with id: " + id));

            Company company = companyService.getCompanyByUser(user);
            if (!logSheet.getCompany().getId().equals(company.getId())) {
                return ResponseEntity.status(403).body("You are not allowed to update this logsheet");
            }

            LogSheet updatedLogSheet = companyService.updateLogSheet(id, title, musicIds);
            return ResponseEntity.ok(updatedLogSheet);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("LogSheet update failed: " + e.getMessage());
        }
    }



    @DeleteMapping("/logsheet/{id}")
    public ResponseEntity<?> deleteLogSheet(@PathVariable Long id) {
        try {
            companyService.deleteLogSheet(id);
            return ResponseEntity.ok("LogSheet deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("LogSheet deletion failed: " + e.getMessage());
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


on the Company panel, when the company create a logsheet and select which music they want. On the Admin panel and Artist Panel, create a tab called Performance 
on this tab, or section
a)	For Artist, give a well detailed insight about the performance of the individual music they upload. Give them analysis of, which companies selected the music(Played), each company how many times they played that track, overall performance from all companies used the music,  please use these endpoints well and track the performance.
b)	For Admin side, Track performance of Artist, tracking how each artist is performance based on the log sheet created, each song where by you say it belong to who and which company played the music and how many times each company played the music and also overall played for each song 

2.	For Admin Panel
On the pending profile tables, display the pending profiles in a table for like spreadsheet table, and have a Action column where you say (view profile, Reject, Approve)
a)	When viewing the Artist profile (I must view the whole profile submitted from the Artist panel, view the form and all the documents together try using this API /api/admin/userdocumentsandprofiles/ and pull Everything I mean first page display the form details and than second page the documets)
Here is a Json response form example
{
    "passportphoto": {
        "id": 1,
        "imageTitle": "2025",
        "imageUrl": "https://api.owellgraphics.com/api/passportphoto/view/Screenshot 2025-08-21 235353_1758624478989.png",
        "fileType": "image/png",
        "datePosted": "2025-09-23",
        "user": {
            "id": 2,
            "email": "joelkalimbwe3@gmail.com",
            "password": "$2a$10$Mo9Gb5yrbfrITWZ.iK72O.CwZR6gmYgGGcBFVZn/VACW/CXCHGvEG",
            "role": "ARTIST",
            "enabled": true,
            "emailVerified": true,
            "verificationToken": null,
            "resetPasswordToken": "9c44f567-bde0-4f3b-a8f8-cd3ce05fdd19",
            "resetPasswordTokenExpiry": "2025-09-23T08:00:07.462284",
            "username": "joelkalimbwe3@gmail.com",
            "authorities": [
                {
                    "authority": "ROLE_ARTIST"
                }
            ],
            "accountNonExpired": true,
            "accountNonLocked": true,
            "credentialsNonExpired": true
        }
    },
    "proofOfPayment": null,
    "bankConfirmationLetter": null,
    "idDocument": null,
    "memberDetails": {
        "id": 1,
        "tittle": null,
        "firstName": "Joel",
        "surname": "Kalimbwe",
        "idNumber": 34334534,
        "pseudonym": "joel",
        "phoneNumber": "0812320168",
        "email": "joelkalimbwe3@gmail.com",
        "groupNameORStageName": "qwefw",
        "maritalStatus": null,
        "memberCategory": null,
        "noOFDependents": 12,
        "typeOfWork": "jazz",
        "gender": null,
        "line1": "Kehemu Primary School, Rundu, Namibia",
        "line2": "green well",
        "city": "Rundu",
        "region": null,
        "poBox": "1123",
        "postalCode": "10000",
        "country": "Namibia",
        "birthDate": "2001-02-23",
        "placeOfBirth": "Rundu",
        "idOrPassportNumber": "132123432",
        "nationality": "Namibian",
        "occupation": "Software Enginner",
        "nameOfEmployer": "Joel Chipoa Kalimbwe",
        "addressOfEmployer": "Kehemu Primary School, Rundu, Namibia",
        "nameOfTheBand": "Joel Chipoa Kalimbwe",
        "dateFounded": "2022-09-23",
        "numberOfBand": 2,
        "bankName": null,
        "accountHolderName": "Joel",
        "bankAccountNumber": "21222",
        "bankAccountType": "cheque",
        "bankBranchName": "brunch",
        "bankBranchNumber": "32212313",
        "user": {
            "id": 2,
            "email": "joelkalimbwe3@gmail.com",
            "password": "$2a$10$Mo9Gb5yrbfrITWZ.iK72O.CwZR6gmYgGGcBFVZn/VACW/CXCHGvEG",
            "role": "ARTIST",
            "enabled": true,
            "emailVerified": true,
            "verificationToken": null,
            "resetPasswordToken": "9c44f567-bde0-4f3b-a8f8-cd3ce05fdd19",
            "resetPasswordTokenExpiry": "2025-09-23T08:00:07.462284",
            "username": "joelkalimbwe3@gmail.com",
            "authorities": [
                {
                    "authority": "ROLE_ARTIST"
                }
            ],
            "accountNonExpired": true,
            "accountNonLocked": true,
            "credentialsNonExpired": true
        },
        "status": {
            "id": 1,
            "status": "PENDING"
        },
        "notes": null,
        "artistId": "YTNKA01JO1",
        "ipi_number": null
    }
}


This is the full admin file
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
            return ResponseEntity.badRequest().body("Failed to get pending profiles: " + e.getMessage());
        }
    }
    
    @PostMapping("/profile/approve/{memberId}")
    public ResponseEntity<?> approveProfile(@PathVariable Long memberId, @RequestBody Map<String, String> request) {
        try {
            String ipiNumber = request.get("ipiNumber");
            MemberDetails approvedProfile = memberDetailsService.approveMemberDetails(memberId, ipiNumber);
            return ResponseEntity.ok(approvedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Profile approval failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/profile/reject/{memberId}")
    public ResponseEntity<?> rejectProfile(@PathVariable Long memberId, @RequestBody Map<String, String> request) {
        try {
            String notes = request.get("notes");
            MemberDetails rejectedProfile = memberDetailsService.rejectMemberDetails(memberId, notes);
            return ResponseEntity.ok(rejectedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Profile rejection failed: " + e.getMessage());
        }
    }
    
    @GetMapping("/pending-music")
    public ResponseEntity<?> getPendingMusic() {
        try {
            return ResponseEntity.ok(adminService.getPendingMusic());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get pending music: " + e.getMessage());
        }
    }
    
    @PostMapping("/music/approve/{musicId}")
    public ResponseEntity<?> approveMusic(@PathVariable Long musicId, @RequestBody Map<String, String> request) {
        try {
            String isrcCode = request.get("isrcCode");
            ArtistWork approvedMusic = adminService.approveMusic(musicId, isrcCode);
            return ResponseEntity.ok(approvedMusic);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Music approval failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/music/reject/{musicId}")
    public ResponseEntity<?> rejectMusic(@PathVariable Long musicId, @RequestBody Map<String, String> request) {
        try {
            String notes = request.get("notes");
            ArtistWork rejectedMusic = adminService.rejectMusic(musicId, notes);
            return ResponseEntity.ok(rejectedMusic);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Music rejection failed: " + e.getMessage());
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
            
            User user = adminService.createCompanyUser(email, password, companyName, companyAddress, companyPhone, contactPerson, companyEmail);
            
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
            return ResponseEntity.badRequest().body("Company creation failed: " + e.getMessage());
        }
    }

    //update the Company
    @PutMapping("/company/update/{id}")
    public ResponseEntity<?> updateCompany(@PathVariable Long id, @RequestBody Map<String, String> request) {
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
            return ResponseEntity.badRequest().body("Company update failed: " + e.getMessage());
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
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
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
            return ResponseEntity.badRequest().body("Failed to get companies: " + e.getMessage());
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
            documents.put("passportphoto", passportPhotoService.getByUserId(userId).orElse(null));
            documents.put("proofOfPayment", proofOfPaymentService.getByUserId(userId).orElse(null));
            documents.put("idDocument", idDocumentService.getByUserId(userId).orElse(null));
            documents.put("bankConfirmationLetter", bankConfirmationLetterService.getByUserId(userId).orElse(null));
            documents.put("memberDetails",memberDetailsService.getByUserId(userId).orElse(null));
            return ResponseEntity.ok(documents);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching documents for userId " + userId + ": " + e.getMessage());
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
            return ResponseEntity.badRequest().body("Error fetching music for userId " + userId + ": " + e.getMessage());
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
            return ResponseEntity.badRequest().body("Admin creation failed: " + e.getMessage());
        }
    }

    // Update Admin
    @PutMapping("/admins/update/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Map<String, String> request) {
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
            return ResponseEntity.badRequest().body("Failed to fetch admins: " + e.getMessage());
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
            return ResponseEntity.badRequest().body("Admin deletion failed: " + e.getMessage());
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
            return ResponseEntity.badRequest().body("LogSheet deletion failed: " + e.getMessage());
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


b)	When action is Approve Profile, a dialog must pop out saying enter the ipiNumber to approve artist and have a buton to say continue or cancel than when you submit than use the endpoint,  /api/admin/profile/approve/
Make sure the specific profile is selected by their id or something like that 
c)	When action is Reject profile, A dialog must pop out also and saying enter notes
to Reject Profile and use the endpoint /api/admin/profile/reject/
 use the endpoints properly


and to Approve or reject music its the same things  here is there endpoints
5. Approve Music
```
/api/admin/music/approve/

{
    "isrcCode": ""
}
```

 6. Reject Music
```
/api/admin/music/reject/


{
    "notes": ""
}

Show a dialog when admin wants to Approve where they enter the isrcCode values and notes for rejection.

3.	Invoices and Artist payments  when I click Send Invoice or Send payments I am getting this Error 
4.	404: NOT_FOUNDCode: NOT_FOUNDID: cpt1:cpt1::cvjn6-1758629204661-09bd70bacb86

Read our documentation to learn more about this error. Please fix this error 
5.	
6.	package com.example.musicroyalties.controllers.invoiceControllers;

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
    public Invoice  sendInvoice(@Valid @RequestBody Invoice invoice, @RequestParam String clientEmail) throws Exception {
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
    public ArtistInvoiceReports sendInvoice(@Valid @RequestBody ArtistInvoiceReports invoice, @RequestParam String clientEmail) throws Exception {
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


when am logged in and I try to refresh the page or I  try to reload the page I am getting this error below for all the 3 panels 

404: NOT_FOUNDCode: NOT_FOUNDID: cpt1:cpt1::7skjt-1758629357754-dd1a6830d1e2

Read our documentation to learn more about this error.


Work on and fix it please




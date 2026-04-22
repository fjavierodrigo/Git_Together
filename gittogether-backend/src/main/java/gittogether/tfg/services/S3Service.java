package gittogether.tfg.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    public String subirArchivo(MultipartFile archivo) throws IOException {
        String nombreArchivo = UUID.randomUUID().toString() + "_" + archivo.getOriginalFilename();

        // Petición para subir a S3 SIN ACL
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(nombreArchivo)
                .contentType(archivo.getContentType())
                // .acl("public-read")  me hacia que la peticion fuese rechazada
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(archivo.getInputStream(), archivo.getSize()));

        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, nombreArchivo);
    }
}

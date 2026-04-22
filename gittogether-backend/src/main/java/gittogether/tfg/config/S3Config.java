package gittogether.tfg.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Value("${aws_access_key_id}")
    private String accessKey;

    @Value("${aws_secret_access_key}")
    private String secretKey;

    @Value("${aws_session_token}")
    private String sessionToken;

    @Value("${aws.s3.region}")
    private String region;

    @Bean
    public S3Client s3Client() {
        // Usamos AwsSessionCredentials porque estamos en un laboratorio de AWS Academy
        AwsSessionCredentials credentials = AwsSessionCredentials.create(accessKey, secretKey, sessionToken);

        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }
}

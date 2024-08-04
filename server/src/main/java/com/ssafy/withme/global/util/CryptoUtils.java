package com.ssafy.withme.global.util;

import org.springframework.beans.factory.annotation.Value;

import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;

public class CryptoUtils {

//    @Value("${crypto.password}")
    private static String secretKey;

    static {
        try {
            String password = System.getProperty("crypto.password");
            if (password != null) {
                secretKey = password;
                MessageDigest sha = MessageDigest.getInstance("SHA-256");
                byte[] key = password.getBytes(StandardCharsets.UTF_8);
                key = sha.digest(key);
                key = Arrays.copyOf(key, 16); // AES는 16바이트(128비트), 24바이트(192비트), 32바이트(256비트) 키를 사용합니다.
                secretKey = Base64.getEncoder().encodeToString(key);
            } else {
                throw new IllegalArgumentException("crypto.password 시스템 속성이 설정되지 않았습니다.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("CryptoUtils 초기화 중 오류 발생", e);
        }
    }

    public static String encrypt(String value) throws Exception {

        SecretKeySpec spec = new SecretKeySpec(Base64.getDecoder().decode(secretKey), "AES");
        Cipher cipher = Cipher.getInstance(ALGORITHM);

        cipher.init(Cipher.ENCRYPT_MODE, spec);

        byte[] encrypted = cipher.doFinal(value.getBytes());

        return Base64.getEncoder().encodeToString(encrypted);
    }

    private static final String ALGORITHM = "AES/ECB/PKCS5Padding";
    private static final byte[] KEY = secretKey.getBytes();

    public static String decrypt(String value) throws Exception {

        SecretKeySpec spec = new SecretKeySpec(Base64.getDecoder().decode(secretKey), "AES");
        Cipher cipher = Cipher.getInstance(ALGORITHM);

        cipher.init(Cipher.DECRYPT_MODE, spec);

        byte[] decoded = Base64.getDecoder().decode(value);
        byte[] decrypted = cipher.doFinal(decoded);

        return new String(decrypted);
    }
}

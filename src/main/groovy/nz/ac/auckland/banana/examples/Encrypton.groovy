package nz.ac.auckland.banana.examples

import org.codehaus.groovy.runtime.EncodingGroovyMethods

import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import java.nio.ByteBuffer
import java.security.SecureRandom
import java.security.spec.KeySpec


def pass = "myBig20yrPony"

encrypt(pass, "nasty little secret")


def encrypt(String pass, String text) {

	// generate 128-bit salt
	byte[] salt = getRandomBytes(16)
	String saltString = salt.encodeHex().toString();
	// iteration count for PBEKeySpec
	int cycles = 10000;

	// encode password+salt with PBKDF2
	byte[] t1 = encodePassword(pass, salt, cycles)
	// split encoded password into pmk and pak (master key and authenticity key)
	byte[] pmk = t1[0..15]
	byte[] pak = t1[16..31]
	println "PBKDF2 = ${t1.encodeHex()} ${t1.length} bytes\npmk = ${pmk.encodeHex()}\npak = ${pak.encodeHex()}"

	// generate random key
	byte[] randomKey = getRandomBytes(16);
	String randomKeyString = randomKey.encodeHex().toString();
	println "key  = $randomKeyString\nsalt = $saltString"

	// encrypt random key with encoded password (pmk)
	Cipher cipher = Cipher.getInstance("AES/ECB/NoPadding");
	SecretKey kmSpec =  new SecretKeySpec(pmk, "AES")
	cipher.init(Cipher.ENCRYPT_MODE, kmSpec)
	byte[] encryptedKey = cipher.doFinal(randomKey)
	println "encryptedKey = ${encryptedKey.encodeHex()} ${encryptedKey.length} bytes"

	// test encrypted key can be decrypted
	def decodedTest = decryptKey(encryptedKey, pass, saltString, cycles)
	println "decoded key = ${decodedTest.key.encodeHex()} ${decodedTest.key.length} bytes"
	println "must be equal to random key - ${decodedTest.key.encodeHex().toString().equals(randomKeyString)}"

	// let IV be the initialisation vector for use when encrypting the file data (16 bytes)
	// let Q (metadata) be the concatenated values s | c | encryptedKey | IV.
	// let aQ be the authenticity record for Q, defined as H(Q, ka), where H is a cryptographic hash function in a HMAC construction, e.g. HMAC-SHA256.
	// store Q and aQ in the file header.
	byte[] iv = getRandomBytes(16)
	byte[] bc = intToBytes(cycles)
	println "int to bytes "+bc.encodeHex().toString()
	def q = []
	[salt, bc, encryptedKey, iv].each {bytes->  q.addAll(bytes) }

	println "Q = "+(q as byte[]).encodeHex().toString()

	//Cipher dcipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
}

def intToBytes(int i){
	ByteBuffer b = ByteBuffer.allocate(4);
	//b.order(ByteOrder.BIG_ENDIAN); // optional, the initial order of a byte buffer is always BIG_ENDIAN.
	b.putInt(i);
	return b.array()
}

/**
 * Encodes given password
 * @param password
 * @param salt when ciphering, salt is generated. when deciphering salt is taken from the header
 * @param cycles same as for salt
 * @return 32-bytes array
 */
def encodePassword(String password, byte[] salt, int cycles){
	PBEKeySpec pbeKeySpec = new PBEKeySpec(password.toCharArray(), salt, cycles, 256);
	SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
	SecretKey tmp = factory.generateSecret(pbeKeySpec)
	return tmp.getEncoded()
}

def decryptKey(byte[] encryptedKey, String password, String salt, int cycles){
	Cipher cipherDecode = Cipher.getInstance("AES/ECB/NoPadding");
	byte[] decodedSalt = EncodingGroovyMethods.decodeHex(salt.toString());
	byte[] t1 = encodePassword(password, decodedSalt, cycles)
	byte[] masterKey = t1[0..15]
	byte[] authKey = t1[16..31]
	SecretKey kmSpecDecode =  new SecretKeySpec(masterKey, "AES")
	cipherDecode.init(Cipher.DECRYPT_MODE, kmSpecDecode)
	byte[] decodedTest = cipherDecode.doFinal(encryptedKey)
	return [key: decodedTest, pak: authKey]
}

def getRandomBytes(int length) {
	SecureRandom random = new SecureRandom()
	byte[] bytes = new byte[length]
	random.nextBytes(bytes)
	return bytes
}
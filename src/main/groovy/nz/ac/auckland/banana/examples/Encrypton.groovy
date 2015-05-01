package nz.ac.auckland.banana.examples

import org.codehaus.groovy.runtime.EncodingGroovyMethods

import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import java.security.SecureRandom
import java.security.spec.KeySpec


def pass = "myBig20yrPony"

encrypt(pass, "nasty little secret")


def encrypt(String pass, String text) {
	// generate random key
	def randomKey = getRandomBytes(16);
	def randomKeyString = randomKey.encodeHex().toString();
	// generate 128-bit salt
	def salt = getRandomBytes(16)
	def saltString = salt.encodeHex().toString();
	println "key  = $randomKeyString\nsalt = $saltString"
	// iteration count for PBEKeySpec
	def cycles = 10000;
	// encode password with PBKDF2
	PBEKeySpec pbeKeySpec = new PBEKeySpec(pass.toCharArray(), salt, cycles, 256);
	SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
	SecretKey tmp = factory.generateSecret(pbeKeySpec)
	// split encoded password into km and ka (master key and authenticity key)
	println "PBKDF2 = ${tmp.getEncoded().encodeHex()} ${tmp.getEncoded().length} bytes"
	byte[] t1 = tmp.getEncoded()
	byte[] masterKey = t1[0..15]
	byte[] authKey = t1[16..31]
	println "km = ${masterKey.encodeHex()}\nka = ${authKey.encodeHex()}"
	// encrypt random key with encoded password
	Cipher cipher = Cipher.getInstance("AES/ECB/NoPadding");
	SecretKey kmSpec =  new SecretKeySpec(masterKey, "AES")
	cipher.init(Cipher.ENCRYPT_MODE, kmSpec)
	byte[] encryptedKey = cipher.doFinal(randomKey)
	println "encryptedKey = ${encryptedKey.encodeHex()} ${encryptedKey.length} bytes"

	// test encypted key can be decrypted
	Cipher cipherDecode = Cipher.getInstance("AES/ECB/NoPadding");
	SecretKey kmSpecDecode =  new SecretKeySpec(masterKey, "AES")
	cipherDecode.init(Cipher.DECRYPT_MODE, kmSpecDecode)
	byte[] decodedTest = cipherDecode.doFinal(encryptedKey)
	println "decoded key = ${decodedTest.encodeHex()} ${decodedTest.length} bytes"
	println "must be equal to random key"


	//Cipher dcipher = Cipher.getInstance("AES/CBC/PKCS5Padding");

	byte[] decodedSalt = EncodingGroovyMethods.decodeHex(saltString.toString());
}


def getRandomBytes(int length) {
	SecureRandom random = new SecureRandom()
	byte[] bytes = new byte[length]
	random.nextBytes(bytes)
	return bytes
}
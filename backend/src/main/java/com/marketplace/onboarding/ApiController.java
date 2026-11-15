package com.marketplace.onboarding;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequestMapping("/api") @CrossOrigin(origins="http://localhost:5173")
public class ApiController {
 private final SellerRepository sellers; private final ProductRepository products;
 public ApiController(SellerRepository s, ProductRepository p){sellers=s;products=p;}
 public record Decision(String decision){}
 @PostMapping("/sellers") public ResponseEntity<Seller> register(@RequestBody Seller s){
  if(sellers.existsByEmail(s.email)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Email already registered");
  s.status="PENDING"; return ResponseEntity.status(201).body(sellers.save(s));
 }
 @GetMapping("/sellers") public List<Seller> sellers(){return sellers.findAll();}
 @PatchMapping("/sellers/{id}/decision") public Seller sellerDecision(@PathVariable Long id,@RequestBody Decision d){
  Seller s=sellers.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
  s.status=decision(d.decision()); return sellers.save(s);
 }
 @PostMapping("/products/seller/{sellerId}") public ResponseEntity<Product> addProduct(@PathVariable Long sellerId,@RequestBody Product p){
  Seller s=sellers.findById(sellerId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Seller not found"));
  if(!"APPROVED".equals(s.status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Seller is not approved");
  p.seller=s;p.status="PENDING_REVIEW";return ResponseEntity.status(201).body(products.save(p));
 }
 @GetMapping("/products") public List<Product> products(@RequestParam(required=false) Long sellerId){
  return sellerId==null?products.findAll():products.findBySellerId(sellerId);
 }
 @GetMapping("/products/approved") public List<Product> approved(){return products.findByStatus("APPROVED");}
 @PatchMapping("/products/{id}/decision") public Product productDecision(@PathVariable Long id,@RequestBody Decision d){
  Product p=products.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
  p.status=decision(d.decision());return products.save(p);
 }
 private String decision(String value){
  String v=value==null?"":value.toUpperCase(Locale.ROOT);
  if(!v.equals("APPROVE")&&!v.equals("REJECT")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Decision must be APPROVE or REJECT");
  return v.equals("APPROVE")?"APPROVED":"REJECTED";
 }
}

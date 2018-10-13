#lang racket

(provide racket-tests
         make-vc-test
         vc-test?
         vc-test-name vc-test-cred
         vc-test-issue-valid? vc-test-verify-valid?
         vc-test-extra-invoker-args vc-test-extra-verifier-args
         vc-test-extra-invoker-checks vc-test-extra-verifier-checks
         vc-test-invoker-resources vc-test-verifier-resources)

(require racket/runtime-path
         json)

(define-runtime-path parent-dir
  "..")

(define (resource-path filename)
  (build-path parent-dir "resources" filename))

(define (load-test-cred filename)
  (call-with-input-file (build-path parent-dir "tests-1.0" filename)
    read-json))

(define minimal-valid-cred
  (load-test-cred "minimal-valid.jsonld"))

(struct vc-test
  (name cred issue-valid? verify-valid?
   extra-invoker-args extra-verifier-args
   extra-invoker-checks extra-verifier-checks
   invoker-resources verifier-resources))

(define/contract (make-vc-test name cred
                               #:issue-valid? [issue-valid? #t]
                               #:verify-valid? [verify-valid? #t]
                               #:extra-invoker-args [extra-invoker-args '()]
                               #:extra-verifier-args [extra-verifier-args '()]
                               #:extra-invoker-checks [extra-invoker-checks '()]
                               #:extra-verifier-checks [extra-verifier-checks '()]
                               #:invoker-resources [invoker-resources #hash()]
                               #:verifier-resources [verifier-resources #hash()])
  (->* (string? hash-eq?)
       (#:issue-valid? boolean?
        #:verify-valid? boolean?
        #:extra-invoker-args (listof string?)
        #:extra-verifier-args (listof string?)
        #:extra-invoker-checks (listof procedure?)
        #:extra-verifier-checks (listof procedure?)
        #:invoker-resources hash-equal?
        #:verifier-resources hash-equal?)
       vc-test?)
  (vc-test name cred issue-valid? verify-valid?
           extra-invoker-args extra-verifier-args
           extra-invoker-checks extra-verifier-checks
           invoker-resources verifier-resources))

(define revokeable-cred
  (hash-set minimal-valid-cred
            'credentialStatus
            #hasheq((id . "https://dmv.example.gov/status/24")
                    (type . "CredentialStatusList2017"))))

;; This one has a revocation list with this item present and
;; revoked... thus it must not appear
(define issuer-can-revoke-test
  (make-vc-test
   "Issuer can revoke VC"
   revokeable-cred
   #:verifier-resources
   `#hash(("https://dmv.example.gov/status/24"
           . ,(resource-path "credential-revocation.jsonld")))
   #:issue-valid? #t
   #:verify-valid? #f))

;; This one doesn't have the revocation present, nbd
(define issuer-no-revocation-test
  (make-vc-test
   "Issuer can revoke VC"
   revokeable-cred
   #:verifier-resources
   `#hash(("https://dmv.example.gov/status/24"
           . ,(resource-path "credential-empty-revocation.jsonld")))
   #:issue-valid? #t
   #:verify-valid? #t))

(define racket-tests
  (list issuer-can-revoke-test issuer-no-revocation-test))

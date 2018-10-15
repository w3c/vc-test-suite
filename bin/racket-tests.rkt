#lang racket

(provide racket-tests
         vc-test<%>
         simple-vc-test%
         json-vc-test%)

(require racket/runtime-path
         json
         rackunit
         net/url)

(define-runtime-path parent-dir
  "..")

(define (resource-path filename)
  (build-path parent-dir "resources" filename))

(define (load-test-cred filename)
  (call-with-input-file (build-path parent-dir "tests-1.0" filename)
    read-json))

(define minimal-cred
  (load-test-cred "minimal-valid.jsonld"))

(define vc-test<%>
  (interface ()
    [get-issuer-url (->m string?)]
    [get-public-key (->m path?)]
    [get-private-key (->m path?)]
    [get-owner (->m string?)]
    [get-name (->m string?)]
    [get-cred (->m hash-eq?)]
    [get-issue-valid? (->m boolean?)]
    [get-verify-valid? (->m (or/c boolean? 'skip))]
    [modify-issuer-args (->m (listof string?) (listof string?))]
    [modify-verifier-args (->m (listof string?) (listof string?))]
    [modify-issuer-resources (->m hash-equal? hash-equal?)]
    [modify-verifier-resources (->m hash-equal? hash-equal?)]
    [run-issuer-checks (->m string? any/c)]
    #;run-verifier-checks))

(define vc-test-base%
  (class object%
    (super-new)
    ;; these ones are all defaults for now...
    (define/public (get-issuer-url)
      "https://example.com/issuer/keys/1")
    (define/public (get-public-key)
      (build-path parent-dir "keys" "key-1-public.pem"))
    (define/public (get-private-key)
      (build-path parent-dir "keys" "key-1-private.pem"))
    (define/public (get-owner)
      "https://example.com/owner")

    ;; ok these ones we actually init
    (init-field name
                [cred minimal-cred]
                [issue-valid? #t] [verify-valid? #t]
                [issuer-args '()] [verifier-args '()]
                [issuer-resources #hash()] [verifier-resources #hash()])
    (define/public (get-name)
      name)
    (define/public (get-cred)
      cred)
    (define/public (get-issue-valid?)
      issue-valid?)
    (define/public (get-verify-valid?)
      verify-valid?)
    (define/public (modify-issuer-args args)
      (append args issuer-args))
    (define/public (modify-verifier-args args)
      (append args verifier-args))
    (define/public (modify-issuer-resources resources)
      (for/fold ([resources resources])
                ([(key val) issuer-resources])
        (hash-set resources key val)))
    (define/public (modify-verifier-resources resources)
      (for/fold ([resources resources])
                ([(key val) verifier-resources])
        (hash-set resources key val)))))

;; Very simple verifiable claims test...
;; no special functions or anything
(define simple-vc-test%
  (class* vc-test-base% (vc-test<%>)
    (super-new)
    (init-field [issuer-checks '()]
                #;[verifier-checks '()])
    (define/public (run-issuer-checks issued-cred-string)
      (call/ec
       (lambda (return)
         (unless (null? issuer-checks)
           (define issued-cred-json 'unset)
           (test-not-exn
            "stdout is valid json"
            (lambda ()
              (set! issued-cred-json
                    (call-with-input-string issued-cred-string read-json))))
           (when (eq? issued-cred-json 'unset)
             ;; must have failed...
             (return (void)))
           (test-not-exn
            "No unexpected exceptions in checks"
            (lambda ()
              (for ([check issuer-checks])
                (check issued-cred-json))))))))))

(define json-vc-test%
  (class* vc-test-base% (vc-test<%>)
    (init-field js-doc
                [base-dir parent-dir])
    (super-new
     [name (hash-ref js-doc 'name)]
     [cred
      (call-with-input-file (build-path base-dir (hash-ref js-doc 'file))
        read-json)]
     [issue-valid? (hash-ref js-doc 'issueValid #t)]
     [verify-valid? (hash-ref js-doc 'verifyValid #t)]
     [issuer-args (hash-ref js-doc 'extraIssuerArgs '())]
     [verifier-args (hash-ref js-doc 'extraVerifierArgs '())])
    (define/public (run-issuer-checks issued-cred)
      #;(match (hash-ref test 'checkIssuedScript #f)
        [#f (void)]
        [script-path
         (define python-path
           (build-path base-dir script-path))
         'TODO])
      'TODO)))

(define revokeable-cred
  (hash-set minimal-cred
            'credentialStatus
            #hasheq((id . "https://dmv.example.gov/status/24")
                    (type . "CredentialStatusList2017"))))

;; This one has a revocation list with this item present and
;; revoked... thus it must not appear
(define issuer-can-revoke-test
  (new simple-vc-test%
       [name "Issuer can revoke VC"]
       [cred revokeable-cred]
       [verifier-resources
        `#hash(("https://dmv.example.gov/status/24"
                . ,(resource-path "credential-revocation.jsonld")))]
       [verify-valid? #f]))

;; This one doesn't have the revocation present, nbd
(define issuer-no-revocation-test
  (new simple-vc-test%
       [name "Issuer non-revocation VC verifies"]
       [cred revokeable-cred]
       [verifier-resources
        `#hash(("https://dmv.example.gov/status/24"
                . ,(resource-path "credential-empty-revocation.jsonld")))]))

(define has-proof
  (new simple-vc-test%
       [name "Provides proof"]
       [verify-valid? 'skip]
       [issuer-checks
        (list
         (lambda (issued)
           (test-not-false
            "Proof field is present"
            (or (hash-ref issued 'proof #f)
                (hash-ref issued 'signature #f)))))]))

;; The following two regexes copied from https://stackoverflow.com/a/37563868
;;   (CC BY-SA 3.0, though I think copyright doesn't apply to regexes)
(define iso-8601-rx
  #px"^\\d{4}(-\\d\\d(-\\d\\d(T\\d\\d:\\d\\d(:\\d\\d)?(\\.\\d+)?(([+-]\\d\\d:\\d\\d)|Z)?)?)?)?$")

(define (valid-date? str)
  (regexp-match iso-8601-rx str))

;; The only person who is likely to complain about this is
;; Gregg Kellogg.  Are you reading my code, Gregg?
(define uri-rx
  #px".+:.+")

(define (valid-uri? str)
  (regexp-match uri-rx str))

(define proof-suite%
  (class object%
    (super-new)
    (init-field name
                [creator-required? #t]
                [created-required? #t])
    (define/public (get-name)
      name)
    (define/public (required-properties-present? proof)
      (and (or (hash-has-key? proof 'type)
               (hash-has-key? proof '@type))
           (hash-has-key? proof 'creator)
           (hash-has-key? proof 'created)
           (or (hash-has-key? proof 'signatureValue)
               (hash-has-key? proof 'proofValue))))
    (define/public (proof-acceptable? proof)
      (and (required-properties-present? proof)
           (string? (hash-ref proof 'type))
           (and creator-required?
                (string? (hash-ref proof 'creator))
                (valid-uri? (hash-ref proof 'creator)))
           (and created-required?
                (string? (hash-ref proof 'created))
                (valid-date? (hash-ref proof 'created)))
           (or (and (hash-has-key? proof 'signatureValue)
                    (string? (hash-ref proof 'signatureValue)))
               (and (hash-has-key? proof 'proofValue)
                    (string? (hash-ref proof 'proofValue))))))))

(define lds2015-proof-suite
  (new
   (class proof-suite%
     (super-new [name "LinkedDataSignature2015"]))))
(define ed25519-proof-suite
  (new
   (class proof-suite%
     (super-new [name "Ed25519VerificationKey2018"]))))
(define rsa2018-proof-suite
  (new
   (class proof-suite%
     (super-new [name "RsaSignature2018"]))))

(define proof-suites
  (for/fold ([result #hash()])
            ([suite (list lds2015-proof-suite
                          ed25519-proof-suite
                          rsa2018-proof-suite)])
    (hash-set result (send suite get-name) suite)))

(define (get-proof issued)
  (or (hash-ref issued 'proof #f)
      (hash-ref issued 'signature)))
(define (get-ldtype obj)
  (match (or (hash-ref obj 'type #f)
             (hash-ref obj '@type #f))
    [(list val) val]
    [val val]))

(define proof-known-suite
  (new simple-vc-test%
       [name "Proof uses known proof suite"]
       [verify-valid? 'skip]
       [issuer-checks
        (list
         (lambda (issued)
           (define proof (get-proof issued))
           (define proof-type (get-ldtype proof))
           (test-true
            "Proof type is member of known proof suites"
            (hash-has-key? proof-suites proof-type))))]))

(define proof-required-properties-present
  (new simple-vc-test%
       [name "Required proof properties are present"]
       [verify-valid? 'skip]
       [issuer-checks
        (list
         (lambda (issued)
           (define proof (get-proof issued))
           (define proof-type (get-ldtype proof))
           (define suite (hash-ref proof-suites proof-type))
           (test-true
            "Required properties are present"
            (send suite required-properties-present? proof))))]))

(define proof-acceptable
  (new simple-vc-test%
       [name "Proof properties are valid and verifiable per suite"]
       [verify-valid? 'skip]
       [issuer-checks
        (list
         (lambda (issued)
           (define proof (get-proof issued))
           (define proof-type (get-ldtype proof))
           (define suite (hash-ref proof-suites proof-type))
           (test-true
            "Proof data is in acceptable form for verifying"
            (send suite proof-acceptable? proof))))]))

;; This is a negative test for
;; "`credentialStatus` value MUST be a status scheme that provides
;;  enough information to determine current status of credential"
(define bogus-credentialStatus-scheme-invalid
  (new simple-vc-test%
       [name "Bogus credentialStatus scheme should be invalid"]
       [cred
        (hash-set minimal-cred
                  'credentialStatus
                  #hasheq((id . "urn:sha1:56742d9965815c154442b8914aabc2fb89b7dc0a")
                          (type . "urn:sha1:a5b997075fd07435ede2a65469e3177cbbdfae2a")))]
       [verify-valid? #f]))

(define racket-tests
  (list issuer-can-revoke-test issuer-no-revocation-test
        has-proof
        proof-known-suite
        proof-required-properties-present
        proof-acceptable
        bogus-credentialStatus-scheme-invalid))

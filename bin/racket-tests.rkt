#lang racket

(provide racket-tests
         vc-test<%>
         simple-vc-test%
         json-vc-test%)

(require racket/runtime-path
         json
         rackunit)

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
    (init-field name cred
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
       [issue-valid? #t]
       [verify-valid? #f]))

;; This one doesn't have the revocation present, nbd
(define issuer-no-revocation-test
  (new simple-vc-test%
       [name "Issuer non-revocation VC verifies"]
       [cred revokeable-cred]
       [verifier-resources
        `#hash(("https://dmv.example.gov/status/24"
                . ,(resource-path "credential-empty-revocation.jsonld")))]
       [issue-valid? #t]
       [verify-valid? #t]))

(define valid-proof-suite
  (new simple-vc-test%
       [name "Proof uses known proof suite"]
       [cred minimal-cred]
       [issue-valid? #t]
       [verify-valid? 'skip]
       [issuer-checks
        (list
         (lambda (issued)
           (define proof
             (or (hash-ref issued 'proof #f)
                 (hash-ref issued 'signature)))
           (define proof-type
             (match (or (hash-ref proof 'type #f)
                        (hash-ref proof '@type #f))
               [(list val) val]
               [val val]))
           (test-not-false
            "Proof type is member of known proof suites"
            (member proof-type
                    ;; Extend this as more proof suites are supported
                    '("RsaSignature2018"
                      "Ed25519Signature2018"
                      "LinkedDataSignature2015")))))]))

(define racket-tests
  (list issuer-can-revoke-test issuer-no-revocation-test
        valid-proof-suite))

#lang racket

(require rackunit
         rackunit/text-ui
         rackunit/gui
         json
         racket/runtime-path)

(define-runtime-path here ".")
(define-runtime-path parent-dir
  "..")
(define tests-dir (build-path parent-dir "tests-1.0"))
(define resources-dir (build-path parent-dir "resources"))
(define keys-dir (build-path parent-dir "keys"))
(define contexts-dir (build-path parent-dir "contexts"))

(define data-model-1.0
  (call-with-input-file (build-path parent-dir "vc-data-model-1.0.json")
    read-json))

(define default-options
  `#hasheq((issuerUrl . "https://example.com/issuer/keys/1")
           (publicKey . ,(build-path parent-dir "keys" "key-1-public.pem"))
           (owner . "https://example.com/owner")
           (privateKey . ,(build-path parent-dir "keys" "key-1-private.pem"))
           (issue-valid . #t)
           (verify-valid . #t)
           (skip . #f)))

(define default-options-initial
  (hash-ref (hash-ref data-model-1.0 'base) 'default))

(require linkeddata/pk)

(define (gen-test-suite tests issuer validator)
  (define-syntax-rule (with-env body ...)
    (parameterize ([current-environment-variables
                    (environment-variables-copy
                     (current-environment-variables))])
      (define jsonld-loader-map
        (string-join (for/list ([(key val) (hash-ref data-model-1.0 'resources)])
                       (string-append (symbol->string key) "="
                                      (path->string (build-path parent-dir val))))
                     ","))
      (putenv "JSONLD_LOADER_MAP" jsonld-loader-map)
      body ...))
  (test-suite
   "Verifiable Claims 1.0 Data Model Test Suite"
   (for/list ([test tests])
     (define test-options
       (for/fold ([test-options default-options])
                 ([(key val) test])
         (hash-set test-options key val)))
     (define input-json
       (call-with-input-file (build-path parent-dir (hash-ref test-options 'file))
         read-json))
     (define-values (issuer-stdout issuer-stderr issuer-exit-code)
       (with-env
         (parameterize ([current-custodian (make-custodian)])
           (match-define (list stdout stdin pid stderr interact)
             (process* issuer
                       "-i" (hash-ref test-options 'issuerUrl)
                       "-r" (path->string (hash-ref test-options 'privateKey))))
           (write-json input-json stdin)
           (close-output-port stdin)
           (interact 'wait)
           (values (port->string stdout) (port->string stderr)
                   (interact 'exit-code)))))
     ;; Let's start out with the basic structure from the existing json
     ;; file and we can refactor later
     (test-suite
      (hash-ref test-options 'name)
      (with-check-info (;; TODO: input-json
                        ['issuer-stdout (string-info issuer-stdout)]
                        ['issuer-stderr (string-info issuer-stderr)]
                        ['issuer-exit-code issuer-exit-code])
        (if (hash-ref test-options 'issue-valid)
            (test-eqv? "Issuer should succeed (exit status zero)"
                       issuer-exit-code 0)
            (test-false "Issuer should fail (exit status nonzero)"
                        (eqv? issuer-exit-code 0))))))))


#;(struct success ())
#;(struct failure (message))

#;(define (run-test args config-dir resources entry)
  (call/ec
   (λ (return)
     (when (hash-has-key? entry 'skip)
       )
     

     ))

  )


#;(define (main)
  
  ;; parser.add_argument(
  ;;     '--verbose', action='count', default=0,
  ;;     dest='verbosity', help='Increase output verbosity.'
  ;;     ' [%(default)s]')
  ;; parser.add_argument(
  ;;     '-c', '--config', action='store', default=DEFAULTS['config'],
  ;;     dest='config', help='The test suite configuration file.'
  ;;     ' [%(default)s]')
  ;; parser.add_argument(
  ;;     '-i', '--issuer', action='store', default=DEFAULTS['issuer'],
  ;;     dest='issuer', help='The verifiable claims issuer program.'
  ;;     ' [%(default)s]')
  ;; parser.add_argument(
  ;;     '-v', '--verifier', action='store', default=DEFAULTS['verifier'],
  ;;     dest='verifier', help='The verifiable claims verifier program.'
  ;;     ' [%(default)s]')
  ;;
  ;; return parser.parse_args()

  )



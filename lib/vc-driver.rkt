#lang racket

(provide gen-test-suite default-tests verbose-tests?
         test-suite->json-core)

(require rackunit
         rackunit/text-ui
         rackunit/gui
         json
         racket/runtime-path
         "racket-tests.rkt")

(define-runtime-path parent-dir
  "..")

(define data-model-1.0
  (call-with-input-file (build-path parent-dir "vc-data-model-1.0.json")
    read-json))
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

(define verbose-tests?
  (make-parameter #f))

(define (run-one-test test issuer verifier)
  (define-syntax-rule (with-check-info-maybe params body ...)
    (let ([to-run
           (lambda () body ...)])
      (if (verbose-tests?)
          (with-check-info params
            (to-run))
          (to-run))))

  ;; Let's start out with the basic structure from the existing json
  ;; file and we can refactor later
  (test-suite
   (send test get-name)
   (call/ec
    (λ (return)
      (define input-json
        (send test get-cred))
      (define-values (issuer-stdout issuer-stderr issuer-exit-code)
        (with-env
          (parameterize ([current-custodian (make-custodian)])
            (match-define (list stdout stdin pid stderr interact)
              (process* issuer
                        "-i" (send test get-issuer-url)
                        "-r" (send test get-private-key)))
            (write-json input-json stdin)
            (close-output-port stdin)
            (interact 'wait)
            (values (port->string stdout) (port->string stderr)
                    (interact 'exit-code)))))
      ;; Now run verifier checks
      (with-check-info-maybe (;; TODO: input-json
                              ['issuer-stdout (string-info issuer-stdout)]
                              ['issuer-stderr (string-info issuer-stderr)]
                              ['issuer-exit-code issuer-exit-code])
        ;; Run extra issuer logic
        (send test run-issuer-checks issuer-stdout)
        (cond
          ;; Issuer is expected to be valid
          [(send test get-issue-valid?)
           (test-eqv? "Issuer should succeed (exit status zero)"
                      issuer-exit-code 0)
           ;; If we got a nonzero answer on the issuer, we can't do
           ;; the verifier usefully anyway, so bail out.
           ;; Also, we support skipping verification step.
           (when (or (not (eqv? issuer-exit-code 0))
                     (eq? (send test get-verify-valid?) 'skip))
             (return (void)))
           (define-values (verifier-stdout verifier-stderr verifier-exit-code)
             (with-env
               (parameterize ([current-custodian (make-custodian)])
                 (match-define (list stdout stdin pid stderr interact)
                   (process* verifier
                             "-i" (send test get-issuer-url)
                             "-p" (path->string (send test get-public-key))))
                 (write-string issuer-stdout stdin)
                 (close-output-port stdin)
                 (interact 'wait)
                 (values (port->string stdout) (port->string stderr)
                         (interact 'exit-code)))))
           ;; Finally, let's see if the exit status was what we expected
           (with-check-info-maybe (['verifier-stdout (string-info verifier-stdout)]
                                   ['verifier-stderr (string-info verifier-stderr)]
                                   ['verifier-exit-code verifier-exit-code])
             (cond
               ;; verifier is expected to validate
               [(send test get-verify-valid?)
                (test-eqv? "Verifier should succeed (exit status zero)"
                           verifier-exit-code 0)
                ;; If we got a nonzero answer on the verifier, we can't do
                ;; any additional checks anyway, so bail out
                ;; TODO: Well we aren't doing additional tests yet so...
                #;(when (not (eqv? verifier-exit-code 0))
                    (return (void)))]
               [else
                (test-false "Verifier should fail (exit status nonzero)"
                            (eqv? verifier-exit-code 0))]))]
          ;; issuer is expected to be invalid
          [else
           (test-false "Issuer should fail (exit status nonzero)"
                       (eqv? issuer-exit-code 0))]))))))

(define (gen-test-suite tests issuer verifier)
  (test-suite
   "Verifiable Claims 1.0 Data Model"
   (for/list ([test tests])
     (run-one-test test issuer verifier))))

;;;;;;;;;;;
;; tests ;;
;;;;;;;;;;;

(define (generate-tests data-model-base racket-tests)
  (define (convert-data-model-test test)
    ;; TODO: handle Python script stuff
    (new json-vc-test%
         [js-doc test]))
  (define data-model-tests
    (map convert-data-model-test
         (hash-ref data-model-base 'test)))
  ;; TODO: Do we want to sort these?
  (append racket-tests data-model-tests))

(define default-tests
  (generate-tests data-model-1.0 racket-tests))

(define (test-suite->json-core test-suite)
  (define fold-results
    (fold-test-results
     ;; Handle each result.  If it's
     (lambda (result seed)
       (match seed
         [(vector result-data suite-names)
          (vector 
           (match suite-names
             [(list _ ... this-suite top-suite)
              (if (test-success? result)
                  result-data
                  ;; If the result is a failure, we mark the whole
                  ;; corresponding suite as such
                  (hash-set result-data this-suite #f))])
           suite-names)]))
     (vector #hash() ; result data, a hashmap of "name" => passing?
             '())    ; names of how many layers deep in the test suite we are
     test-suite
     ;; On the way down we cons on how many levels deep we are in terms of
     ;; these suites
     #:fdown
     (lambda (name seed)
       (match seed
         [(vector result-data suite-names)
          (if (= (length suite-names) 1)
              (vector ;; test is passing until it isn't
               (hash-set result-data name #t)
               (cons name suite-names))
              (vector result-data (cons name suite-names)))]))
     ;; On the way back up we pop off a level of suites
     #:fup
     (lambda (name seed)
       (match seed
         [(vector result-data suite-names)
          (vector result-data (cdr suite-names))]))))
  (match fold-results
    [(vector test-results _)
     (for/fold ([json #hasheq()])
               ([(suite-name suite-val) test-results])
       (hash-set json (string->symbol suite-name) suite-val))]))


#;(test/gui
   (gen-test-suite default-tests
                   (string->path "/home/cwebber/devel/vc-js/bin/vc-js-issuer")
                   (string->path "/home/cwebber/devel/vc-js/bin/vc-js-verifier")))

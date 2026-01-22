package org.example.learnhubproject.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * 성능 임계값 기반 AOP
 *
 * 설정한 임계값을 초과하는 경우만 WARN 로그로 출력
 * 정상 범위는 INFO 로그 또는 출력하지 않음
 *
 * 사용하려면 PerformanceAspect를 주석 처리하고 이 클래스를 활성화하세요.
 */
@Slf4j
@Aspect
// @Component  // 사용하려면 주석 해제
public class PerformanceThresholdAspect {

    // 성능 임계값 (밀리초)
    private static final long CONTROLLER_THRESHOLD_MS = 1000; // 1초
    private static final long SERVICE_THRESHOLD_MS = 500;     // 0.5초

    @Pointcut("execution(* org.example.learnhubproject.controller..*(..))")
    public void controllerLayer() {}

    @Pointcut("execution(* org.example.learnhubproject.service..*(..))")
    public void serviceLayer() {}

    @Around("controllerLayer()")
    public Object measureControllerPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        return measureWithThreshold(joinPoint, CONTROLLER_THRESHOLD_MS, "Controller");
    }

    @Around("serviceLayer()")
    public Object measureServicePerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        return measureWithThreshold(joinPoint, SERVICE_THRESHOLD_MS, "Service");
    }

    private Object measureWithThreshold(ProceedingJoinPoint joinPoint, long thresholdMs, String layer) throws Throwable {
        long startTime = System.currentTimeMillis();

        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();

        Object result = null;
        boolean isException = false;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable e) {
            isException = true;
            log.error("[EXCEPTION] {}.{}() 예외 발생: {}",
                className, methodName, e.getMessage());
            throw e;
        } finally {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;

            // 임계값 초과 시에만 로그 출력
            if (executionTime > thresholdMs) {
                log.warn("[SLOW {}] {}.{}() 실행 시간: {}ms (임계값: {}ms 초과!)",
                    layer, className, methodName, executionTime, thresholdMs);
            } else if (isException) {
                log.warn("[PERFORMANCE] {}.{}() 실행 시간: {}ms (예외 발생)",
                    className, methodName, executionTime);
            }
            // 정상 범위는 로그 출력하지 않음 (필요시 DEBUG 레벨로 출력 가능)
            else {
                log.debug("[PERFORMANCE] {}.{}() 실행 시간: {}ms",
                    className, methodName, executionTime);
            }
        }
    }
}
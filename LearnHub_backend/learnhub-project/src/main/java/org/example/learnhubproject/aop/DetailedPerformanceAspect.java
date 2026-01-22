package org.example.learnhubproject.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * 더 상세한 성능 측정 AOP (파라미터 포함)
 *
 * 주의: 민감한 정보(비밀번호 등)가 로그에 노출될 수 있으니
 * 프로덕션 환경에서는 주의해서 사용하세요.
 *
 * 사용하려면 PerformanceAspect를 주석 처리하고 이 클래스를 활성화하세요.
 */
@Slf4j
@Aspect
// @Component  // 사용하려면 주석 해제
public class DetailedPerformanceAspect {

    @Pointcut("execution(* org.example.learnhubproject.controller..*(..))")
    public void controllerLayer() {}

    @Pointcut("execution(* org.example.learnhubproject.service..*(..))")
    public void serviceLayer() {}

    @Around("controllerLayer() || serviceLayer()")
    public Object measureExecutionTimeWithParams(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        // 메서드 파라미터 로깅 (민감 정보 주의!)
        log.info("[START] {}.{}() 시작 - 파라미터: {}",
            className, methodName, Arrays.toString(args));

        Object result = null;
        boolean isException = false;

        try {
            result = joinPoint.proceed();

            // 반환값 로깅 (민감 정보 주의!)
            log.info("[END] {}.{}() 종료 - 반환값: {}",
                className, methodName, result);

            return result;
        } catch (Throwable e) {
            isException = true;
            log.error("[EXCEPTION] {}.{}() 예외 발생: {}",
                className, methodName, e.getMessage(), e);
            throw e;
        } finally {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;

            if (isException) {
                log.warn("[PERFORMANCE] {}.{}() 실행 시간: {}ms (예외 발생)",
                    className, methodName, executionTime);
            } else {
                log.info("[PERFORMANCE] {}.{}() 실행 시간: {}ms",
                    className, methodName, executionTime);
            }
        }
    }
}
package org.example.learnhubproject.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * Controller와 Service 레이어의 메서드 실행 시간을 측정하는 AOP
 *
 * @Aspect: 이 클래스가 Aspect임을 명시
 * @Component: Spring Bean으로 등록
 */
@Slf4j
@Aspect
@Component
public class PerformanceAspect {

    /**
     * Pointcut 1: Controller 패키지 하위의 모든 메서드
     * execution(* org.example.learnhubproject.controller..*(..))
     * - 첫 번째 *: 모든 반환 타입
     * - ..: 하위 패키지 포함
     * - *: 모든 클래스
     * - (..): 모든 파라미터
     */
    @Pointcut("execution(* org.example.learnhubproject.controller..*(..))")
    public void controllerLayer() {}

    /**
     * Pointcut 2: Service 패키지 하위의 모든 메서드
     */
    @Pointcut("execution(* org.example.learnhubproject.service..*(..))")
    public void serviceLayer() {}

    /**
     * Around Advice: Controller와 Service 메서드 실행 전후에 실행
     *
     * @param joinPoint 실행되는 메서드의 정보를 담고 있는 객체
     * @return 원본 메서드의 반환값
     * @throws Throwable 원본 메서드에서 발생한 예외를 그대로 전파
     */
    @Around("controllerLayer() || serviceLayer()")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        // 메서드 시작 시간
        long startTime = System.currentTimeMillis();

        // 실행되는 메서드의 시그니처 정보
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();

        Object result = null;
        boolean isException = false;

        try {
            // 실제 메서드 실행
            result = joinPoint.proceed();
            return result;
        } catch (Throwable e) {  // Exception → Throwable로 변경 (Error도 포함)
            isException = true;
            // 예외 발생 시 로그 남기고 다시 던짐
            log.error("[EXCEPTION] {}.{}() 실행 중 예외 발생: {}",
                className, methodName, e.getMessage());
            throw e;  // 원본 예외를 그대로 재throw (스택 트레이스 유지)
        } finally {
            // 메서드 종료 시간
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;

            // 실행 시간 로그 출력 (예외 여부 표시)
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
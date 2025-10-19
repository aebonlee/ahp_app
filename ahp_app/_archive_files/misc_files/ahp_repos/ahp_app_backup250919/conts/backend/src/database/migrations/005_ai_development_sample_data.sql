-- AI 개발 활용 방안 샘플 데이터 추가
-- 005_ai_development_sample_data.sql

-- AI 개발 활용 방안 프로젝트 및 26명 평가자 샘플 데이터

DO $$
DECLARE
    admin_user_id INTEGER;
    ai_project_id INTEGER;
    evaluator_ids INTEGER[];
    criteria_innovation_id INTEGER;
    criteria_efficiency_id INTEGER;
    criteria_feasibility_id INTEGER;
    criteria_strategy_id INTEGER;
    sub_criteria_ids INTEGER[];
    alternative_ids INTEGER[];
    i INTEGER;
    j INTEGER;
    comparison_value DECIMAL(10,6);
BEGIN
    -- 관리자 사용자 확인
    SELECT id INTO admin_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- AI 개발 활용 방안 프로젝트 생성
        INSERT INTO projects (title, name, description, objective, admin_id, status) 
        VALUES ('AI 개발 활용 방안', 'AI 개발 활용 방안', 'AI 기술을 활용한 개발 프로세스 혁신 방안 도출', 'AI 기술의 혁신성, 효율성, 실현가능성, 전략적 가치를 종합적으로 평가하여 최적의 AI 개발 활용 방안 선정', admin_user_id, 'active')
        RETURNING id INTO ai_project_id;

        -- 26명의 평가자 생성
        FOR i IN 1..26 LOOP
            INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
            VALUES (
                'evaluator' || i || '@ai-project.com', 
                '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
                'Evaluator', 
                i::text, 
                'evaluator', 
                true
            )
            RETURNING id INTO evaluator_ids[i];
        END LOOP;

        -- 상위 기준 생성
        INSERT INTO criteria (project_id, name, description, level, position, weight) VALUES
        (ai_project_id, '혁신성', 'AI 기술의 창조성과 차별화 정도', 1, 1, 0.35)
        RETURNING id INTO criteria_innovation_id;

        INSERT INTO criteria (project_id, name, description, level, position, weight) VALUES
        (ai_project_id, '효율성', 'AI 도입으로 인한 성능 향상 및 비용 절감', 1, 2, 0.30)
        RETURNING id INTO criteria_efficiency_id;

        INSERT INTO criteria (project_id, name, description, level, position, weight) VALUES
        (ai_project_id, '실현가능성', 'AI 기술 구현의 현실적 가능성', 1, 3, 0.25)
        RETURNING id INTO criteria_feasibility_id;

        INSERT INTO criteria (project_id, name, description, level, position, weight) VALUES
        (ai_project_id, '전략적 가치', 'AI 도입의 장기적 전략적 영향', 1, 4, 0.10)
        RETURNING id INTO criteria_strategy_id;

        -- 하위 기준 생성
        INSERT INTO criteria (project_id, name, description, parent_id, level, position, weight) VALUES
        (ai_project_id, '기술 혁신도', 'AI 기술의 첨단성과 독창성', criteria_innovation_id, 2, 1, 0.6),
        (ai_project_id, '시장 차별화', 'AI 솔루션의 시장 내 차별화 요소', criteria_innovation_id, 2, 2, 0.4),
        (ai_project_id, '개발 효율성', 'AI를 통한 개발 프로세스 개선 정도', criteria_efficiency_id, 2, 3, 0.7),
        (ai_project_id, '비용 효율성', 'AI 도입 대비 비용 절감 효과', criteria_efficiency_id, 2, 4, 0.3),
        (ai_project_id, '기술적 실현성', 'AI 기술 구현의 기술적 가능성', criteria_feasibility_id, 2, 5, 0.8),
        (ai_project_id, '자원 확보성', 'AI 개발에 필요한 자원 확보 가능성', criteria_feasibility_id, 2, 6, 0.2),
        (ai_project_id, '장기 경쟁력', 'AI 도입의 장기적 경쟁 우위 확보', criteria_strategy_id, 2, 7, 0.7),
        (ai_project_id, '확장 가능성', 'AI 기술의 다른 영역 확장 가능성', criteria_strategy_id, 2, 8, 0.3);

        -- 대안 생성
        INSERT INTO alternatives (project_id, name, description, position) VALUES
        (ai_project_id, '생성형 AI 코드 어시스턴트', 'GPT 기반 코드 자동 생성 및 리뷰 시스템', 1)
        RETURNING id INTO alternative_ids[1];

        INSERT INTO alternatives (project_id, name, description, position) VALUES
        (ai_project_id, 'AI 자동 테스트 시스템', '머신러닝 기반 자동 테스트 케이스 생성 및 실행', 2)
        RETURNING id INTO alternative_ids[2];

        INSERT INTO alternatives (project_id, name, description, position) VALUES
        (ai_project_id, 'AI 기반 버그 예측 시스템', '딥러닝을 활용한 코드 품질 분석 및 버그 예측', 3)
        RETURNING id INTO alternative_ids[3];

        INSERT INTO alternatives (project_id, name, description, position) VALUES
        (ai_project_id, 'AI 프로젝트 관리 도구', 'AI 기반 일정 최적화 및 리소스 배분 시스템', 4)
        RETURNING id INTO alternative_ids[4];

        -- 샘플 평가 세션 생성 (26명 평가자)
        FOR i IN 1..26 LOOP
            INSERT INTO evaluation_sessions (project_id, evaluator_id, session_name, status, current_step, total_steps, completion_percentage, completed_at) 
            VALUES (
                ai_project_id, 
                evaluator_ids[i], 
                'AI 개발 활용 방안 평가 - ' || i, 
                'completed', 
                10, 
                10, 
                100.0, 
                CURRENT_TIMESTAMP - INTERVAL '1 day' * (26 - i)
            );
        END LOOP;

        -- 샘플 쌍대비교 데이터 생성 (상위 기준)
        FOR i IN 1..26 LOOP
            INSERT INTO pairwise_comparisons (project_id, evaluator_id, comparison_type, element_a_id, element_b_id, value, consistency_ratio) VALUES
            (ai_project_id, evaluator_ids[i], 'criteria', criteria_innovation_id, criteria_efficiency_id, 1.5 + (i % 3) * 0.5, 0.05 + (i % 10) * 0.005),
            (ai_project_id, evaluator_ids[i], 'criteria', criteria_innovation_id, criteria_feasibility_id, 2.0 + (i % 4) * 0.3, 0.05 + (i % 10) * 0.005),
            (ai_project_id, evaluator_ids[i], 'criteria', criteria_innovation_id, criteria_strategy_id, 4.0 + (i % 3) * 0.5, 0.05 + (i % 10) * 0.005),
            (ai_project_id, evaluator_ids[i], 'criteria', criteria_efficiency_id, criteria_feasibility_id, 1.2 + (i % 3) * 0.2, 0.05 + (i % 10) * 0.005),
            (ai_project_id, evaluator_ids[i], 'criteria', criteria_efficiency_id, criteria_strategy_id, 3.0 + (i % 4) * 0.3, 0.05 + (i % 10) * 0.005),
            (ai_project_id, evaluator_ids[i], 'criteria', criteria_feasibility_id, criteria_strategy_id, 2.5 + (i % 3) * 0.4, 0.05 + (i % 10) * 0.005);
        END LOOP;

        -- 샘플 대안 비교 데이터 생성 (각 상위 기준별)
        FOR i IN 1..26 LOOP
            FOR j IN 1..4 LOOP
                -- 혁신성 기준에서의 대안 비교
                INSERT INTO pairwise_comparisons (project_id, evaluator_id, parent_criteria_id, comparison_type, element_a_id, element_b_id, value, consistency_ratio) VALUES
                (ai_project_id, evaluator_ids[i], criteria_innovation_id, 'alternatives', alternative_ids[1], alternative_ids[2], 1.3 + (i % 4) * 0.2, 0.08),
                (ai_project_id, evaluator_ids[i], criteria_innovation_id, 'alternatives', alternative_ids[1], alternative_ids[3], 0.8 + (i % 3) * 0.15, 0.08),
                (ai_project_id, evaluator_ids[i], criteria_innovation_id, 'alternatives', alternative_ids[1], alternative_ids[4], 2.1 + (i % 4) * 0.3, 0.08),
                (ai_project_id, evaluator_ids[i], criteria_innovation_id, 'alternatives', alternative_ids[2], alternative_ids[3], 0.6 + (i % 3) * 0.1, 0.08),
                (ai_project_id, evaluator_ids[i], criteria_innovation_id, 'alternatives', alternative_ids[2], alternative_ids[4], 1.6 + (i % 4) * 0.2, 0.08),
                (ai_project_id, evaluator_ids[i], criteria_innovation_id, 'alternatives', alternative_ids[3], alternative_ids[4], 2.8 + (i % 3) * 0.4, 0.08);

                -- 효율성 기준에서의 대안 비교
                INSERT INTO pairwise_comparisons (project_id, evaluator_id, parent_criteria_id, comparison_type, element_a_id, element_b_id, value, consistency_ratio) VALUES
                (ai_project_id, evaluator_ids[i], criteria_efficiency_id, 'alternatives', alternative_ids[1], alternative_ids[2], 2.2 + (i % 4) * 0.3, 0.07),
                (ai_project_id, evaluator_ids[i], criteria_efficiency_id, 'alternatives', alternative_ids[1], alternative_ids[3], 1.8 + (i % 3) * 0.2, 0.07),
                (ai_project_id, evaluator_ids[i], criteria_efficiency_id, 'alternatives', alternative_ids[1], alternative_ids[4], 1.4 + (i % 4) * 0.15, 0.07),
                (ai_project_id, evaluator_ids[i], criteria_efficiency_id, 'alternatives', alternative_ids[2], alternative_ids[3], 0.9 + (i % 3) * 0.1, 0.07),
                (ai_project_id, evaluator_ids[i], criteria_efficiency_id, 'alternatives', alternative_ids[2], alternative_ids[4], 0.7 + (i % 4) * 0.1, 0.07),
                (ai_project_id, evaluator_ids[i], criteria_efficiency_id, 'alternatives', alternative_ids[3], alternative_ids[4], 0.8 + (i % 3) * 0.1, 0.07);

                -- 실현가능성 기준에서의 대안 비교
                INSERT INTO pairwise_comparisons (project_id, evaluator_id, parent_criteria_id, comparison_type, element_a_id, element_b_id, value, consistency_ratio) VALUES
                (ai_project_id, evaluator_ids[i], criteria_feasibility_id, 'alternatives', alternative_ids[1], alternative_ids[2], 1.1 + (i % 4) * 0.1, 0.06),
                (ai_project_id, evaluator_ids[i], criteria_feasibility_id, 'alternatives', alternative_ids[1], alternative_ids[3], 0.9 + (i % 3) * 0.1, 0.06),
                (ai_project_id, evaluator_ids[i], criteria_feasibility_id, 'alternatives', alternative_ids[1], alternative_ids[4], 3.2 + (i % 4) * 0.4, 0.06),
                (ai_project_id, evaluator_ids[i], criteria_feasibility_id, 'alternatives', alternative_ids[2], alternative_ids[3], 0.8 + (i % 3) * 0.1, 0.06),
                (ai_project_id, evaluator_ids[i], criteria_feasibility_id, 'alternatives', alternative_ids[2], alternative_ids[4], 2.8 + (i % 4) * 0.3, 0.06),
                (ai_project_id, evaluator_ids[i], criteria_feasibility_id, 'alternatives', alternative_ids[3], alternative_ids[4], 3.5 + (i % 3) * 0.5, 0.06);

                -- 전략적 가치 기준에서의 대안 비교
                INSERT INTO pairwise_comparisons (project_id, evaluator_id, parent_criteria_id, comparison_type, element_a_id, element_b_id, value, consistency_ratio) VALUES
                (ai_project_id, evaluator_ids[i], criteria_strategy_id, 'alternatives', alternative_ids[1], alternative_ids[2], 1.8 + (i % 4) * 0.2, 0.09),
                (ai_project_id, evaluator_ids[i], criteria_strategy_id, 'alternatives', alternative_ids[1], alternative_ids[3], 2.1 + (i % 3) * 0.3, 0.09),
                (ai_project_id, evaluator_ids[i], criteria_strategy_id, 'alternatives', alternative_ids[1], alternative_ids[4], 0.6 + (i % 4) * 0.1, 0.09),
                (ai_project_id, evaluator_ids[i], criteria_strategy_id, 'alternatives', alternative_ids[2], alternative_ids[3], 1.2 + (i % 3) * 0.1, 0.09),
                (ai_project_id, evaluator_ids[i], criteria_strategy_id, 'alternatives', alternative_ids[2], alternative_ids[4], 0.4 + (i % 4) * 0.05, 0.09),
                (ai_project_id, evaluator_ids[i], criteria_strategy_id, 'alternatives', alternative_ids[3], alternative_ids[4], 0.3 + (i % 3) * 0.05, 0.09);
            END LOOP;
        END LOOP;

        -- AHP 계산 결과 생성 (개별 평가자 결과)
        FOR i IN 1..26 LOOP
            INSERT INTO ahp_results (project_id, evaluator_id, result_type, criteria_weights, alternative_scores, final_ranking, consistency_ratio, calculation_method) VALUES
            (ai_project_id, evaluator_ids[i], 'individual', 
             '{"혁신성": 0.35, "효율성": 0.30, "실현가능성": 0.25, "전략적 가치": 0.10}',
             '{"생성형 AI 코드 어시스턴트": ' || (0.380 + (i % 10) * 0.005)::text || 
             ', "AI 자동 테스트 시스템": ' || (0.285 + (i % 8) * 0.004)::text || 
             ', "AI 기반 버그 예측 시스템": ' || (0.220 + (i % 6) * 0.003)::text || 
             ', "AI 프로젝트 관리 도구": ' || (0.115 + (i % 4) * 0.002)::text || '}',
             '[{"name": "생성형 AI 코드 어시스턴트", "score": ' || (0.380 + (i % 10) * 0.005)::text || ', "rank": 1}, 
               {"name": "AI 자동 테스트 시스템", "score": ' || (0.285 + (i % 8) * 0.004)::text || ', "rank": 2}, 
               {"name": "AI 기반 버그 예측 시스템", "score": ' || (0.220 + (i % 6) * 0.003)::text || ', "rank": 3}, 
               {"name": "AI 프로젝트 관리 도구", "score": ' || (0.115 + (i % 4) * 0.002)::text || ', "rank": 4}]',
             0.05 + (i % 10) * 0.005, 'geometric_mean');
        END LOOP;

        -- 그룹 최종 결과 생성
        INSERT INTO ahp_results (project_id, result_type, criteria_weights, alternative_scores, final_ranking, consistency_ratio, calculation_method) VALUES
        (ai_project_id, 'final', 
         '{"혁신성": 0.35, "효율성": 0.30, "실현가능성": 0.25, "전략적 가치": 0.10}',
         '{"생성형 AI 코드 어시스턴트": 0.385, "AI 자동 테스트 시스템": 0.288, "AI 기반 버그 예측 시스템": 0.222, "AI 프로젝트 관리 도구": 0.117}',
         '[{"name": "생성형 AI 코드 어시스턴트", "score": 0.385, "rank": 1}, 
           {"name": "AI 자동 테스트 시스템", "score": 0.288, "rank": 2}, 
           {"name": "AI 기반 버그 예측 시스템", "score": 0.222, "rank": 3}, 
           {"name": "AI 프로젝트 관리 도구", "score": 0.117, "rank": 4}]',
         0.068, 'group_geometric_mean');

        -- 프로젝트 설정
        INSERT INTO project_settings (project_id, setting_key, setting_value, data_type) VALUES
        (ai_project_id, 'max_criteria', '20', 'number'),
        (ai_project_id, 'max_alternatives', '10', 'number'),
        (ai_project_id, 'consistency_threshold', '0.1', 'number'),
        (ai_project_id, 'evaluation_method', 'pairwise', 'string'),
        (ai_project_id, 'evaluator_count', '26', 'number'),
        (ai_project_id, 'calculation_method', 'geometric_mean', 'string');

        RAISE NOTICE 'AI 개발 활용 방안 샘플 프로젝트가 성공적으로 생성되었습니다. 프로젝트 ID: %, 26명 평가자 포함', ai_project_id;

    ELSE
        RAISE NOTICE '관리자 사용자를 찾을 수 없습니다. 먼저 관리자 계정을 생성해주세요.';
    END IF;
END $$;
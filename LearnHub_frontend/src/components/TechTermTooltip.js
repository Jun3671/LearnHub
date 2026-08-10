import React, { useState, useEffect } from 'react';
import { techGlossaryAPI } from '../services/api';

/**
 * 기술 용어에 툴팁을 추가하는 컴포넌트
 * 텍스트에서 기술 용어를 감지하고, 마우스 오버 시 정의를 표시
 */
function TechTermTooltip({ text, className = '' }) {
  const [highlightedText, setHighlightedText] = useState(text);
  const [hoveredTerm, setHoveredTerm] = useState(null);
  const [termDefinitions, setTermDefinitions] = useState({});
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text) return;

    // AI로 기술 용어 추출
    extractAndHighlightTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const extractAndHighlightTerms = async () => {
    try {
      setLoading(true);
      const response = await techGlossaryAPI.extractTerms(text);
      const terms = response.data;

      if (terms && terms.length > 0) {
        // 용어와 정의를 저장
        const definitions = {};
        terms.forEach(term => {
          definitions[term.name] = term.definition;
        });
        setTermDefinitions(definitions);

        // 텍스트에서 용어 하이라이트
        highlightTermsInText(terms.map(t => t.name));
      }
    } catch (error) {
      console.error('기술 용어 추출 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const highlightTermsInText = (terms) => {
    let result = text;

    terms.forEach(term => {
      // 대소문자 구분 없이 단어 경계에서만 매칭
      const regex = new RegExp(`\\b(${escapeRegex(term)})\\b`, 'gi');
      result = result.replace(
        regex,
        `<span class="tech-term" data-term="$1">$1</span>`
      );
    });

    setHighlightedText(result);
  };

  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const handleTermHover = (e) => {
    const termElement = e.target.closest('.tech-term');
    if (!termElement) return;

    const term = termElement.getAttribute('data-term');
    setHoveredTerm(term);

    // 툴팁 위치 계산
    const rect = termElement.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleTermLeave = () => {
    setHoveredTerm(null);
  };

  return (
    <div className={`tech-term-container ${className}`}>
      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>기술 용어 분석 중...</span>
        </div>
      ) : (
        <div
          className="tech-term-text"
          dangerouslySetInnerHTML={{ __html: highlightedText }}
          onMouseOver={handleTermHover}
          onMouseLeave={handleTermLeave}
        />
      )}

      {/* 툴팁 */}
      {hoveredTerm && termDefinitions[hoveredTerm] && (
        <div
          className="tech-term-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999
          }}
        >
          <div className="bg-neutral-800 text-white rounded-xl shadow-2xl p-4 max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              <h4 className="font-bold text-primary-300">{hoveredTerm}</h4>
            </div>
            <p className="text-sm text-neutral-200 leading-relaxed">
              {termDefinitions[hoveredTerm]}
            </p>
            <div className="mt-2 pt-2 border-t border-neutral-700">
              <p className="text-xs text-neutral-400">💡 마우스를 올리면 용어 설명이 표시됩니다</p>
            </div>
          </div>
          {/* 화살표 */}
          <div
            className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid rgb(38, 38, 38)'
            }}
          />
        </div>
      )}

      <style jsx>{`
        .tech-term-container {
          position: relative;
        }

        :global(.tech-term) {
          color: #667eea;
          font-weight: 600;
          cursor: help;
          text-decoration: underline;
          text-decoration-style: dotted;
          text-decoration-color: #667eea;
          text-underline-offset: 3px;
          transition: all 0.2s;
        }

        :global(.tech-term:hover) {
          color: #764ba2;
          background-color: rgba(102, 126, 234, 0.1);
          padding: 0 2px;
          border-radius: 4px;
        }

        .tech-term-text {
          line-height: 1.8;
        }
      `}</style>
    </div>
  );
}

export default TechTermTooltip;

import QRCode from 'qrcode';

/**
 * QR 코드 생성 유틸리티
 */

interface QRCodeOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * URL을 QR 코드 이미지(Base64)로 변환
 */
export async function generateQRCode(
  url: string,
  options?: QRCodeOptions
): Promise<string> {
  const defaultOptions = {
    errorCorrectionLevel: 'M' as const,
    margin: 1,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    ...options,
  };

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, defaultOptions);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR 코드 생성 실패:', error);
    throw new Error('QR 코드를 생성할 수 없습니다.');
  }
}

/**
 * 단축 URL 코드 생성 (6자리 랜덤 문자열)
 */
export function generateShortCode(length: number = 6): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'; // 혼동되기 쉬운 문자 제외
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * 프로젝트 ID로부터 평가 링크 생성
 */
export function generateEvaluationLink(
  projectId: string,
  shortCode?: string
): {
  fullLink: string;
  shortLink: string;
} {
  const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;
  const code = shortCode || generateShortCode();
  
  return {
    fullLink: `${baseUrl}/evaluate/${projectId}`,
    shortLink: `${baseUrl}/e/${code}`,
  };
}

/**
 * 평가자 초대 메시지 템플릿 생성
 */
export function generateInvitationMessage(
  projectTitle: string,
  researcherName: string,
  shortLink: string,
  deadline?: string,
  estimatedTime: number = 12
): string {
  return `
안녕하세요,

${researcherName}입니다.
"${projectTitle}" 연구에 참여를 요청드립니다.

📋 참여 방법:
1. 아래 링크를 클릭하거나 QR코드를 스캔하세요
2. 간단한 인구통계 설문에 응답해주세요 (약 2분)
3. AHP 평가를 수행해주세요 (약 ${estimatedTime - 2}분)

🔗 참여 링크: ${shortLink}

⏰ 예상 소요시간: 약 ${estimatedTime}분
📅 마감일: ${deadline ? new Date(deadline).toLocaleDateString('ko-KR') : '제한 없음'}

귀하의 소중한 의견이 연구에 큰 도움이 됩니다.
감사합니다.
  `.trim();
}

/**
 * QR 코드와 함께 초대 카드 HTML 생성 (이메일용)
 */
export async function generateInvitationCard(
  projectTitle: string,
  shortLink: string,
  qrCodeDataUrl: string
): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    .invitation-card {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #f3f4f6;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 16px;
      color: #6b7280;
    }
    .content {
      padding: 20px 0;
    }
    .qr-code {
      text-align: center;
      margin: 20px 0;
    }
    .qr-code img {
      width: 200px;
      height: 200px;
    }
    .link-section {
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
      margin: 20px 0;
    }
    .link {
      font-size: 18px;
      color: #3b82f6;
      text-decoration: none;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 10px 0;
    }
    .steps {
      list-style: none;
      padding: 0;
    }
    .steps li {
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .steps li:last-child {
      border-bottom: none;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 2px solid #f3f4f6;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="invitation-card">
    <div class="header">
      <h1 class="title">AHP 연구 참여 요청</h1>
      <p class="subtitle">${projectTitle}</p>
    </div>
    
    <div class="content">
      <div class="qr-code">
        <img src="${qrCodeDataUrl}" alt="QR Code" />
        <p style="color: #6b7280; font-size: 14px;">QR코드를 스캔하여 참여하세요</p>
      </div>
      
      <div class="link-section">
        <p style="margin-bottom: 10px;">또는 아래 링크를 클릭하세요:</p>
        <a href="${shortLink}" class="button">평가 시작하기</a>
        <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">${shortLink}</p>
      </div>
      
      <h3>참여 절차</h3>
      <ol class="steps">
        <li>📋 간단한 인구통계 설문 응답 (2분)</li>
        <li>⚖️ AHP 쌍대비교 평가 수행 (10분)</li>
        <li>✅ 결과 확인 및 제출</li>
      </ol>
    </div>
    
    <div class="footer">
      <p>이 이메일은 AHP Research Platform에서 발송되었습니다.</p>
      <p>문의사항이 있으시면 연구자에게 직접 연락해주세요.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
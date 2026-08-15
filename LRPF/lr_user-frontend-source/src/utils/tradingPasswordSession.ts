// REWARDS(TEAM/TREE/RANKS) 거래비밀번호 세션 인증 유지 유틸
//
// 1회 인증 성공 후 1시간 동안 인증 상태를 유지한다.
// 1시간 동안 활동(=인증 상태 조회)이 없거나 로그아웃 시 인증 상태를 초기화한다.
// - sessionStorage 사용: 같은 탭 내 페이지 이동 간에는 유지되고 탭 종료 시 자동 소멸.
// - 슬라이딩 만료: 유효한 상태를 조회할 때마다 만료 시각을 갱신하여 "비활동 1시간" 기준으로 만료.

const STORAGE_KEY = 'lr_rewards_tp_verified_until';
const VERIFIED_TTL_MS = 60 * 60 * 1000; // 1시간

const getStore = (): Storage | null => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

/** 거래비밀번호 인증 성공을 기록한다(만료 시각 = 현재 + 1시간). */
export const markTradingPasswordVerified = (): void => {
  const store = getStore();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, String(Date.now() + VERIFIED_TTL_MS));
  } catch {
    /* storage 사용 불가 시 무시 */
  }
};

/**
 * 현재 거래비밀번호 인증 상태가 유효한지 확인한다.
 * 유효하면 만료 시각을 1시간 뒤로 갱신(슬라이딩)하고 true를 반환한다.
 * 만료되었거나 기록이 없으면 상태를 정리하고 false를 반환한다.
 */
export const isTradingPasswordVerified = (): boolean => {
  const store = getStore();
  if (!store) return false;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return false;
    const expiresAt = Number(raw);
    if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
      store.removeItem(STORAGE_KEY);
      return false;
    }
    // 슬라이딩 갱신: 활동이 있으므로 만료 시각을 연장
    store.setItem(STORAGE_KEY, String(Date.now() + VERIFIED_TTL_MS));
    return true;
  } catch {
    return false;
  }
};

/** 거래비밀번호 인증 상태를 초기화한다(로그아웃 등). */
export const clearTradingPasswordVerified = (): void => {
  const store = getStore();
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
  } catch {
    /* storage 사용 불가 시 무시 */
  }
};

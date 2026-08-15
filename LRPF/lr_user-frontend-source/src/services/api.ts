/**
 * API Service for Longrise AI Platform
 * Centralized API client with authentication and error handling
 */
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { UserData } from '../types/api';

export type { UserData };

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface EmailAvailabilityResponse {
  available: boolean;
  message: string;
}

export interface SendSignupCodeResponse {
  sent: boolean;
  cooldown_seconds: number;
  expires_in_seconds: number;
  message: string;
}

export interface VerifySignupCodeResponse {
  verified: boolean;
  message: string;
}

export interface OTPSetupResponse {
  configured: boolean;
  enabled: boolean;
  issuer: string;
  account: string;
  secret: string;
  otpauth_uri: string;
  qr_code_data_url: string;
}

export interface OTPVerifySetupResponse {
  enabled: boolean;
  configured: boolean;
  backup_codes: string[];
}

export interface WithdrawalPolicyResponse {
  minWithdrawalUsdt: string;
  addressBindingEnabled: boolean;
  serviceRestrictedNotice: string;
  networks: Array<{
    network: 'TRON' | 'BSC';
    apiNetwork: string;
    displayNetwork: string;
    feeUsdt: string;
    addressPattern: string;
  }>;
}

export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}

class ApiService {
  private client: AxiosInstance;
  private tokenKey = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'longrise_token';
  private mockMode = import.meta.env.VITE_MOCK_API === 'true';

  // Mock user database
  private mockUsers: Record<string, { id: string; email: string; password: string; name: string; nickname: string; rank: string }> = {
    'kim_dragon88@test.com': {
      id: 'user_kim_dragon88',
      email: 'kim_dragon88@test.com',
      password: 'dragon88',
      name: 'Kim Dragon',
      nickname: 'Kim_Dragon88',
      rank: 'BLUE DRAGON'
    }
  };

  constructor() {
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    if (!baseURL) {
      throw new Error('VITE_API_BASE_URL environment variable is required');
    }

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private handleError(error: AxiosError): void {
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup');
    if (error.response?.status === 401 && !isAuthRequest) {
      // Token expired or invalid
      this.removeToken();
      window.location.href = '/login';
    }

    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const email = credentials.email.trim().toLowerCase();

    // Mock API mode
    if (this.mockMode) {
      const user = this.mockUsers[email];
      if (user && user.password === credentials.password) {
        const mockToken = `mock_token_${user.id}_${Date.now()}`;
        this.setToken(mockToken);
        // Also store user data for mock mode
        localStorage.setItem('mock_user', JSON.stringify(user));
        return {
          access_token: mockToken,
          token_type: 'Bearer'
        };
      }
      throw new Error('Invalid email or password');
    }

    // Real API mode
    const response = await this.client.post('/auth/login/json', {
      ...credentials,
      email,
    });
    const { access_token } = response.data;

    if (access_token) {
      this.setToken(access_token);
    }

    return response.data;
  }

  async checkSignupEmail(email: string): Promise<EmailAvailabilityResponse> {
    const response = await this.client.post('/auth/signup/check-email', { email });
    return response.data;
  }

  async sendSignupCode(email: string): Promise<SendSignupCodeResponse> {
    const response = await this.client.post('/auth/signup/send-code', { email });
    return response.data;
  }

  async verifySignupCode(email: string, code: string): Promise<VerifySignupCodeResponse> {
    const response = await this.client.post('/auth/signup/verify-code', { email, code });
    return response.data;
  }

  async completeSignup(payload: { email: string; password: string; referral_code?: string }): Promise<LoginResponse> {
    const response = await this.client.post('/auth/signup/complete', payload);
    const { access_token } = response.data;

    if (access_token) {
      this.setToken(access_token);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.removeToken();
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await this.client.post('/auth/refresh');
    const { access_token } = response.data;

    if (access_token) {
      this.setToken(access_token);
    }

    return response.data;
  }

  async testToken(): Promise<UserData> {
    const response = await this.client.post('/auth/test-token');
    return response.data;
  }

  // User management
  async getCurrentUser(): Promise<UserData> {
    // Mock API mode
    if (this.mockMode) {
      const mockUserStr = localStorage.getItem('mock_user');
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr);
        return {
          id: mockUser.id,
          nickname: mockUser.nickname,
          name: mockUser.name,
          email: mockUser.email,
          phone: '010-1234-5678',
          rank: mockUser.rank,
          status: 'active',
          joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          balanceUSDT: 50000,
          lockedUSDT: 25000,
          balanceCNYT: 15000,
          totalAssets: 90000,
          package: 'premium',
          initialInvestment: 10000,
          investmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          sponsorId: 'sponsor_001',
          teamSize: 45,
          teamVol: 500000,
          bodyValue: 100000,
          referralCode: 'KD88BLUE',
          referredByCode: '',
          kycLevel: 3,
          kycStatus: 'verified',
          pageface: true,
          mobileBinding: true,
          hasSetTradingPassword: true,
          isTradingPasswordVerified: false,
          otp: true,
          otpConfigured: true,
          lastLoginAt: new Date().toISOString(),
          distributorStatus: 'active',
          distributorCode: 'DIST_KD88',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      throw new Error('Mock user not found');
    }

    // Real API mode
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateUser(userData: Partial<UserData>): Promise<UserData> {
    const response = await this.client.put('/users/me', userData);
    return response.data;
  }

  async setReferralCode(payload: { referral_code: string }): Promise<UserData> {
    const response = await this.client.post('/account/referral-code', payload);
    return response.data;
  }

  async setTradingPassword(payload: { password: string; confirm_password: string; current_password?: string; otp_code?: string }): Promise<UserData> {
    const response = await this.client.post('/account/trading-password', payload);
    return response.data;
  }

  async verifyTradingPassword(payload: { password: string }): Promise<{ verified: boolean }> {
    const response = await this.client.post('/account/trading-password/verify', payload);
    return response.data;
  }

  async setupOtp(payload: { current_otp_code?: string } = {}): Promise<OTPSetupResponse> {
    const response = await this.client.post('/account/otp/setup', payload);
    return response.data;
  }

  async verifyOtpSetup(payload: { verification_code: string }): Promise<OTPVerifySetupResponse> {
    const response = await this.client.post('/account/otp/verify', payload);
    return response.data;
  }

  async enableOtp(payload: { verification_code: string }): Promise<{ enabled: boolean; configured: boolean }> {
    const response = await this.client.post('/account/otp/enable', payload);
    return response.data;
  }

  async disableOtp(payload: { verification_code: string; password: string }): Promise<UserData> {
    const response = await this.client.post('/account/otp/disable', payload);
    return response.data;
  }

  async createUser(userData: any): Promise<UserData> {
    const response = await this.client.post('/users/', userData);
    return response.data;
  }

  // Additional API methods can be added here
  async getUsers(params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<UserData[]> {
    const response = await this.client.get('/users/', { params });
    return response.data;
  }

  async getUsersCount(status?: string): Promise<{ total_users: number }> {
    const params = status ? { status } : {};
    const response = await this.client.get('/users/count/total', { params });
    return response.data;
  }

  async getUserDashboard(): Promise<any> {
    const response = await this.client.get('/dashboard/me');
    return response.data;
  }

  async getInvestmentPackages(): Promise<any[]> {
    const response = await this.client.get('/investments/packages');
    return response.data;
  }

  async getMyInvestments(): Promise<any[]> {
    const response = await this.client.get('/investments/me');
    return response.data;
  }

  async getMyTransactions(limit = 20): Promise<any[]> {
    const response = await this.client.get('/transactions/me', { params: { limit } });
    return response.data;
  }

  async getMyWithdrawals(): Promise<any[]> {
    const response = await this.client.get('/withdrawals/my');
    return response.data;
  }

  async getNews(limit = 10): Promise<any[]> {
    const response = await this.client.get('/content/news', { params: { limit } });
    return response.data;
  }

  async getSupportFaq(limit = 20): Promise<any[]> {
    const response = await this.client.get('/content/support/faq', { params: { limit } });
    return response.data;
  }

  async getP2PMarket(asset = 'CNYT'): Promise<any> {
    const response = await this.client.get('/market/p2p', { params: { asset } });
    return response.data;
  }

  async purchaseInvestment(payload: { package_id: string; amount?: number }): Promise<any> {
    const response = await this.client.post('/investments/purchase', payload);
    return response.data;
  }

  async createP2POrder(payload: {
    asset: string;
    trade_type: 'buy' | 'sell';
    amount: number;
    price_per_unit: number;
    currency: string;
  }): Promise<any> {
    const response = await this.client.post('/market/p2p/orders', payload);
    return response.data;
  }

  async getMyMarketOrders(asset = 'CNYT'): Promise<any> {
    const response = await this.client.get('/market/p2p/orders/me', { params: { asset } });
    return response.data;
  }

  async cancelP2POrder(tradeId: string): Promise<any> {
    const response = await this.client.post(`/market/p2p/orders/${tradeId}/cancel`);
    return response.data;
  }

  async completeP2POrder(tradeId: string): Promise<any> {
    const response = await this.client.post(`/market/p2p/orders/${tradeId}/complete`);
    return response.data;
  }

  async fillP2POrder(tradeId: string, payload: { amount: number }): Promise<any> {
    const response = await this.client.post(`/market/p2p/orders/${tradeId}/fill`, payload);
    return response.data;
  }

  async createWithdrawal(payload: { amount: number; asset: 'USDT' | 'CNYT'; network: string; wallet_address: string; trading_password: string; otp_code?: string }): Promise<any> {
    const response = await this.client.post('/withdrawals', payload);
    return response.data;
  }

  async getWalletSummary(): Promise<any> {
    const response = await this.client.get('/wallet/summary');
    return response.data;
  }

  async getWithdrawalPolicy(): Promise<WithdrawalPolicyResponse> {
    const response = await this.client.get('/wallet/withdrawal-policy');
    return response.data;
  }

  async createWalletWithdrawal(payload: { network: string; address: string; amountUsdt: number; trading_password: string; otp_code?: string }): Promise<any> {
    const response = await this.client.post('/wallet/withdrawals', payload);
    return response.data;
  }

  async getWalletTransferHistory(): Promise<any[]> {
    const response = await this.client.get('/wallet/histories/transfers');
    return response.data;
  }

  async getWalletPackageHistory(): Promise<any[]> {
    const response = await this.client.get('/wallet/histories/packages');
    return response.data;
  }

  async getWalletEarnRewardHistory(): Promise<any[]> {
    const response = await this.client.get('/wallet/histories/earn-rewards');
    return response.data;
  }

  async createWalletTransfer(payload: { recipient: string; amount: number; asset: string; trading_password: string }): Promise<any> {
    const response = await this.client.post('/wallet/transfers', payload);
    return response.data;
  }

  async createDepositRequest(payload: {
    leader_id: string;
    leader_name: string;
    bank_account?: string;
    deposit_amount?: number;
    notes?: string;
  }): Promise<any> {
    const response = await this.client.post('/wallet/deposit-requests', payload);
    return response.data;
  }

  async getMyDepositRequests(): Promise<any[]> {
    const response = await this.client.get('/wallet/deposit-requests/me');
    return response.data;
  }

  async getDepositAddress(params: { asset?: string; network?: string } = {}): Promise<{
    address: string;
    asset: string;
    network: string;
    displayNetwork?: string;
    qrPayload?: string;
    minConfirmations?: number;
    status?: string;
    assignedAt?: string | null;
  }> {
    const response = await this.client.get('/wallet/deposit-address', {
      params: { asset: params.asset ?? 'USDT', network: params.network ?? 'TRON' },
    });
    return response.data;
  }

  async syncTestnetDeposits(params: { asset?: string; network?: string } = {}): Promise<{
    network: string;
    address: string;
    observed: number;
    credited: number;
    deposits: any[];
  }> {
    const response = await this.client.post('/wallet/deposits/sync', null, {
      params: { asset: params.asset ?? 'USDT', network: params.network ?? 'TRON' },
    });
    return response.data;
  }

  async getMyDeposits(): Promise<any[]> {
    const response = await this.client.get('/wallet/deposits/me');
    return response.data;
  }

  async convertToCNYT(payload: { amount: number; expected_price_usd: number; trading_password: string }): Promise<any> {
    const response = await this.client.post('/wallet/conversions', payload);
    return response.data;
  }

  async createSupportTicket(payload: {
    title: string;
    description: string;
    category: string;
    priority?: string;
    attachments?: string[];
  }): Promise<any> {
    const response = await this.client.post('/support/tickets', payload);
    return response.data;
  }

  async createEmailInquiry(payload: {
    name: string;
    email: string;
    title: string;
    content: string;
    attachments?: string[];
  }): Promise<any> {
    const response = await this.client.post('/support/email-inquiries', payload);
    return response.data;
  }

  async getMySupportTickets(): Promise<any[]> {
    const response = await this.client.get('/support/tickets/my');
    return response.data;
  }

  async getNotifications(): Promise<{ data: any[]; unread: number }> {
    const response = await this.client.get('/notifications');
    return response.data;
  }

  async markNotificationRead(notificationId: string): Promise<any> {
    const response = await this.client.post(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsRead(): Promise<any> {
    const response = await this.client.post('/notifications/read-all');
    return response.data;
  }

  async createRealtimeSession(): Promise<{ websocketUrl: string; expiresIn: number }> {
    const response = await this.client.post('/realtime/session');
    return response.data;
  }

  async getChatThread(): Promise<any> {
    const response = await this.client.get('/support/chat/thread');
    return response.data;
  }

  async sendChatMessage(content: string): Promise<any> {
    const response = await this.client.post('/support/chat/messages', { content });
    return response.data;
  }

  async createFraudReport(payload: {
    fraudster_uid: string;
    fraud_reason: string;
    description: string;
    evidence: string[];
  }): Promise<any> {
    const response = await this.client.post('/support/fraud-reports', payload);
    return response.data;
  }

  async terminateInvestment(investmentId: string): Promise<any> {
    const response = await this.client.post(`/investments/${investmentId}/terminate`);
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearAuth(): void {
    this.removeToken();
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;

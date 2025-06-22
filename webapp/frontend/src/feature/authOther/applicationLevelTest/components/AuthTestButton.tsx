'use client';

import type React from 'react';
import { useState } from 'react';
import { ApiError, createApiClient } from '../../../../api/client';

interface AuthTestResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

const AuthTestButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuthTestResult | null>(null);

  const testAuthentication = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/api/health/auth-test');

      setResult({
        success: true,
        message: 'Authentication successful!',
        data: response,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setResult({
          success: false,
          message: `Authentication failed: ${error.message}`,
          error: `Status: ${error.status}, Data: ${JSON.stringify(error.data, null, 2)}`,
        });
      } else {
        setResult({
          success: false,
          message: 'Unexpected error occurred',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 bg-opacity-60 rounded-xl border border-gray-600">
      <h3 className="text-lg font-semibold mb-4 text-center text-white">
        🔐 Application Level認証テスト
      </h3>

      <button
        onClick={testAuthentication}
        disabled={isLoading}
        className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
          isLoading
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
        }`}
      >
        {isLoading ? '認証テスト中...' : '認証テスト実行'}
      </button>

      {result && (
        <div
          className={`mt-4 p-4 rounded-lg border ${
            result.success
              ? 'bg-green-900 bg-opacity-50 border-green-600 text-green-100'
              : 'bg-red-900 bg-opacity-50 border-red-600 text-red-100'
          }`}
        >
          <div className="font-medium mb-2">
            {result.success ? '✅' : '❌'} {result.message}
          </div>

          {!!result.data && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm opacity-80 hover:opacity-100">
                レスポンス詳細
              </summary>
              <pre className="mt-2 text-xs bg-black bg-opacity-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}

          {result.error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm opacity-80 hover:opacity-100">
                エラー詳細
              </summary>
              <pre className="mt-2 text-xs bg-black bg-opacity-50 p-2 rounded overflow-x-auto">
                {result.error}
              </pre>
            </details>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 text-center">
        このテストはJWT + HMAC二重認証の動作を確認します
      </div>
    </div>
  );
};

export default AuthTestButton;

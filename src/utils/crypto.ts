/**
 * ============================================================
 * 文件：src/utils/crypto.ts
 * 作用：加密工具函数
 * 说明：
 *   - 使用 Web Crypto API 实现 Token 存储加密
 *   - 提供密码 SHA-256 哈希功能
 *   - 所有加密操作均在浏览器端完成
 * ============================================================
 */

/**
 * 生成随机加密密钥
 * @returns CryptoKey 对象
 */
async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * 导出密钥为 Base64 字符串
 * @param key CryptoKey 对象
 * @returns Base64 编码的密钥字符串
 */
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

/**
 * 从 Base64 字符串导入密钥
 * @param base64Key Base64 编码的密钥字符串
 * @returns CryptoKey 对象
 */
async function importKey(base64Key: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * 获取或创建加密密钥
 * 密钥存储在 sessionStorage 中，会话结束后自动清除
 * @returns CryptoKey 对象
 */
async function getOrCreateKey(): Promise<CryptoKey> {
  const keyName = '__crypto_key__'
  let keyBase64 = sessionStorage.getItem(keyName)

  if (!keyBase64) {
    const key = await generateKey()
    keyBase64 = await exportKey(key)
    sessionStorage.setItem(keyName, keyBase64)
  }

  return importKey(keyBase64)
}

/**
 * 加密数据
 * @param data 要加密的字符串
 * @returns 加密后的字符串（格式：iv:encrypted）
 */
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getOrCreateKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(data)

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoded
    )

    // 将 IV 和加密数据合并为 Base64 字符串
    const ivBase64 = btoa(String.fromCharCode(...iv))
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)))

    return `${ivBase64}:${encryptedBase64}`
  } catch (error) {
    console.error('加密失败:', error)
    // 加密失败时返回原始数据（降级处理）
    return data
  }
}

/**
 * 解密数据
 * @param encryptedData 加密的字符串（格式：iv:encrypted）
 * @returns 解密后的原始字符串
 */
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    // 检查是否是加密格式
    if (!encryptedData.includes(':')) {
      // 非加密格式，直接返回（兼容旧数据）
      return encryptedData
    }

    const [ivBase64, encryptedBase64] = encryptedData.split(':')
    const key = await getOrCreateKey()

    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0))
    const encrypted = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0))

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    )

    return new TextDecoder().decode(decrypted)
  } catch (error) {
    console.error('解密失败:', error)
    // 解密失败时返回原始数据（兼容旧数据）
    return encryptedData
  }
}

/**
 * 计算字符串的 SHA-256 哈希值
 * @param data 要哈希的字符串
 * @returns 十六进制哈希字符串
 */
export async function sha256(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 对密码进行哈希处理
 * @param password 原始密码
 * @returns 哈希后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  return sha256(password)
}

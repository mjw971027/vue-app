/**
 * ============================================================
 * 文件：src/utils/format.ts
 * 作用：通用格式化工具函数
 * ============================================================
 */

/**
 * 格式化日期为 YYYY-MM-DD 字符串
 * @param date 日期字符串、Date 对象或 null/undefined
 * @returns 格式化后的日期字符串，无效输入返回 '-'
 */
export function formatDate(date: string | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    // 尝试从字符串格式提取日期
    if (typeof date === 'string' && date.length >= 10) {
      return date.substring(0, 10)
    }
    return '-'
  }
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

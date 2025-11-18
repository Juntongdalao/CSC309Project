// Helper functions for several basic validations

export function isValidUtorid(utorid) {
    return typeof utorid === 'string' && /^[A-Za-z0-9]{7,8}$/.test(utorid);
}
  
export function isValidUofTEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@(mail\.)?utoronto\.ca$/.test(email);
}
  
export function isValidName(name) {
    return typeof name === 'string' && name.length >= 1 && name.length <= 50;
}
  
export function isValidBirthday(birthday) {
    if (typeof birthday !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return false;
  
    const [yStr, mStr, dStr] = birthday.split('-');
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);
  
    const date = new Date(Date.UTC(y, m - 1, d));
    return (
      Number.isInteger(y) &&
      Number.isInteger(m) &&
      Number.isInteger(d) &&
      m >= 1 &&
      m <= 12 &&
      d >= 1 &&
      d <= 31 &&
      date.getUTCFullYear() === y &&
      date.getUTCMonth() + 1 === m &&
      date.getUTCDate() === d
    );
}
  
// Parse + validate birthday
export function parseBirthday(birthday) {
    if (!isValidBirthday(birthday)) {
      throw new Error('Invalid birthday');
    }
    const [yStr, mStr, dStr] = birthday.split('-');
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);
    return new Date(Date.UTC(y, m - 1, d));
}
  
const PWD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;
  
export function isValidPassword(pwd) {
    return typeof pwd === 'string' && PWD_POLICY.test(pwd);
}
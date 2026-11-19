import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });
export type Employee = { id:number; employeeNumber:string; firstName:string; lastName:string; email:string; department:string; country:string; status:string; currentSalary?:{amountMinor:number;currency:string;effectiveAt:string}|null };
export const money = (minor:number, currency:string) => new Intl.NumberFormat(undefined,{style:'currency',currency,maximumFractionDigits:2}).format(minor/100);

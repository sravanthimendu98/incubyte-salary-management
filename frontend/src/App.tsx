import React, { useEffect, useState } from 'react';
import { Alert, AppBar, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Toolbar, Typography } from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { api, Employee, money } from './api';

type Dashboard = { employeeCount:number; activeCount:number; salaryByCurrency:{currency:string;totalMinor:number;averageMinor:number}[]; departments:{department:string;headcount:number;averageSalaryMinor:number}[] };
const emptyForm = { employeeNumber:'', firstName:'', lastName:'', email:'', department:'Engineering', country:'India', hireDate:'2024-01-01', salaryAmount:'8500000', currency:'INR' };
export default function App() {
  const [dashboard,setDashboard] = useState<Dashboard|null>(null);
  const [employees,setEmployees] = useState<Employee[]>([]);
  const [query,setQuery] = useState('');
  const [department,setDepartment] = useState('');
  const [page,setPage] = useState(1);
  const [totalPages,setTotalPages] = useState(1);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [open,setOpen] = useState(false);
  const [form,setForm] = useState(emptyForm);
  const [saving,setSaving] = useState(false);
  const [notice,setNotice] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [d,e] = await Promise.all([
        api.get('/dashboard'),
        api.get('/employees',{params:{q:query,department,page,pageSize:10}})
      ]);
      setDashboard(d.data); setEmployees(e.data.data); setTotalPages(Math.max(1,e.data.pagination.totalPages));
    } catch { setError('Could not load data. Check that the API is running and the database is seeded.'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ const t=setTimeout(()=>{void load();},250); return ()=>clearTimeout(t); },[query,department,page]);
  const submit = async () => {
    setSaving(true); setNotice('');
    try {
      await api.post('/employees',{...form,salaryAmount:Number(form.salaryAmount),hireDate:form.hireDate});
      setOpen(false); setForm(emptyForm); setNotice('Employee created successfully.'); void load();
    } catch (e:any) { setNotice(e?.response?.data?.error || 'Unable to save employee.'); }
    finally { setSaving(false); }
  };
  return <Box minHeight="100vh">
    <AppBar position="static" elevation={0} color="inherit" sx={{borderBottom:'1px solid #e6eaf1'}}>
      <Toolbar sx={{maxWidth:1400,width:'100%',mx:'auto'}}>
        <Avatar sx={{bgcolor:'primary.main',mr:1.5,borderRadius:2}}>A</Avatar>
        <Box flexGrow={1}><Typography fontWeight={800} color="text.primary">ACME <Box component="span" color="primary.main">People</Box></Typography><Typography variant="caption" color="text.secondary">Salary management</Typography></Box>
        <Chip label="HR Manager" variant="outlined" avatar={<Avatar>H</Avatar>}/>
      </Toolbar>
    </AppBar>
    <Box maxWidth={1400} mx="auto" p={{xs:2,md:4}}>
      <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" alignItems={{sm:'center'}} mb={3} gap={2}>
        <Box><Typography variant="h4" fontWeight={800}>Salary overview</Typography><Typography color="text.secondary">Manage employee compensation across your organization.</Typography></Box>
        <Button variant="contained" onClick={()=>setOpen(true)}>+ Add employee</Button>
      </Stack>
      {notice && <Alert severity={notice.includes('successfully')?'success':'info'} sx={{mb:2}} onClose={()=>setNotice('')}>{notice}</Alert>}
      {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
      {loading && !dashboard ? <Box display="flex" justifyContent="center" p={6}><CircularProgress/></Box> : <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={4}><Metric title="Total employees" value={(dashboard?.employeeCount||0).toLocaleString()} subtitle={`${dashboard?.activeCount||0} active employees`} icon={<PeopleAltOutlinedIcon/>}/></Grid>
          <Grid item xs={12} sm={6} md={4}><Metric title="Currencies tracked" value={String(dashboard?.salaryByCurrency.length||0)} subtitle="Salary totals kept separate by currency" icon={<PublicOutlinedIcon/>}/></Grid>
          <Grid item xs={12} sm={6} md={4}><Metric title="Departments" value={String(dashboard?.departments.length||0)} subtitle="Across the organization" icon={<PaymentsOutlinedIcon/>}/></Grid>
        </Grid>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={7}><Card><CardContent><Typography fontWeight={700} mb={2}>Salary summary by currency</Typography>
            {dashboard?.salaryByCurrency.map(s=><Stack key={s.currency} direction="row" justifyContent="space-between" alignItems="center" py={1} borderBottom="1px solid #eef0f4"><Box><Typography fontWeight={700}>{s.currency}</Typography><Typography variant="caption" color="text.secondary">Average salary</Typography></Box><Box textAlign="right"><Typography fontWeight={700}>{money(s.totalMinor,s.currency)} total</Typography><Typography variant="caption" color="text.secondary">{money(s.averageMinor,s.currency)} average</Typography></Box></Stack>)}
          </CardContent></Card></Grid>
          <Grid item xs={12} md={5}><Card><CardContent><Typography fontWeight={700} mb={2}>Department headcount</Typography>
            {dashboard?.departments.slice().sort((a,b)=>b.headcount-a.headcount).slice(0,7).map(d=><Box key={d.department} mb={1.5}><Stack direction="row" justifyContent="space-between"><Typography variant="body2">{d.department}</Typography><Typography variant="body2" fontWeight={700}>{d.headcount.toLocaleString()}</Typography></Stack><Box height={7} bgcolor="#edf0f7" borderRadius={5} mt={.6}><Box height="100%" width={`${Math.max(2,d.headcount/(dashboard.employeeCount||1)*100)}%`} bgcolor="primary.main" borderRadius={5}/></Box></Box>)}
          </CardContent></Card></Grid>
        </Grid>
        <Paper sx={{p:2,borderRadius:3}}>
          <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" gap={2} mb={2}>
            <Box><Typography variant="h6" fontWeight={800}>Employees</Typography><Typography variant="caption" color="text.secondary">Search and manage employee salary records</Typography></Box>
            <Stack direction={{xs:'column',sm:'row'}} gap={1}>
              <TextField size="small" placeholder="Search name, email or ID" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} InputProps={{startAdornment:<SearchIcon fontSize="small" sx={{mr:1,color:'text.secondary'}}/>}}/>
              <TextField select size="small" label="Department" value={department} onChange={e=>{setDepartment(e.target.value);setPage(1)}} sx={{minWidth:170}}><MenuItem value="">All departments</MenuItem>{(dashboard?.departments||[]).map(d=><MenuItem key={d.department} value={d.department}>{d.department}</MenuItem>)}</TextField>
            </Stack>
          </Stack>
          {loading ? <Box p={3} textAlign="center"><CircularProgress size={26}/></Box> : <Table size="small"><TableHead><TableRow><TableCell>EMPLOYEE</TableCell><TableCell>DEPARTMENT</TableCell><TableCell>COUNTRY</TableCell><TableCell>STATUS</TableCell><TableCell align="right">CURRENT SALARY</TableCell></TableRow></TableHead><TableBody>
            {employees.map(e=><TableRow hover key={e.id}><TableCell><Stack direction="row" alignItems="center" gap={1.2}><Avatar sx={{width:32,height:32,fontSize:13}}>{e.firstName[0]}{e.lastName[0]}</Avatar><Box><Typography fontWeight={650} variant="body2">{e.firstName} {e.lastName}</Typography><Typography variant="caption" color="text.secondary">{e.employeeNumber} · {e.email}</Typography></Box></Stack></TableCell><TableCell>{e.department}</TableCell><TableCell>{e.country}</TableCell><TableCell><Chip size="small" label={e.status} color={e.status==='ACTIVE'?'success':'default'}/></TableCell><TableCell align="right">{e.currentSalary?money(e.currentSalary.amountMinor,e.currentSalary.currency):'—'}</TableCell></TableRow>)}
            {!employees.length && <TableRow><TableCell colSpan={5} align="center">No employees found.</TableCell></TableRow>}
          </TableBody></Table>}
          <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}><Typography variant="caption" color="text.secondary">Page {page} of {totalPages}</Typography><Button size="small" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</Button><Button size="small" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</Button></Stack>
        </Paper>
      </>}
    </Box>
    <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Add employee</DialogTitle><DialogContent><Grid container spacing={2} mt={0}>
      {(['employeeNumber','firstName','lastName','email','department','country','hireDate','salaryAmount','currency'] as const).map(k=><Grid item xs={12} sm={k==='email'?12:6} key={k}><TextField fullWidth size="small" label={k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())} type={k==='hireDate'?'date':'text'} InputLabelProps={k==='hireDate'?{shrink:true}:undefined} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></Grid>)}
    </Grid><Typography variant="caption" color="text.secondary" display="block" mt={2}>Salary amount is entered in minor units (e.g. 8500000 = ₹85,000.00).</Typography></DialogContent><DialogActions><Button onClick={()=>setOpen(false)}>Cancel</Button><Button variant="contained" disabled={saving||!form.employeeNumber||!form.firstName||!form.lastName||!form.email} onClick={()=>void submit()}>{saving?'Saving…':'Create employee'}</Button></DialogActions></Dialog>
  </Box>;
}
function Metric({title,value,subtitle,icon}:{title:string;value:string;subtitle:string;icon:React.ReactNode}) {
  return <Card><CardContent><Stack direction="row" justifyContent="space-between"><Box><Typography color="text.secondary" variant="body2">{title}</Typography><Typography variant="h4" fontWeight={800} mt={.5}>{value}</Typography><Typography variant="caption" color="text.secondary">{subtitle}</Typography></Box><Avatar sx={{bgcolor:'#edf2ff',color:'primary.main'}}>{icon}</Avatar></Stack></CardContent></Card>;
}

import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GenericTable } from '../../../../components/table';

type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'age', headerName: 'Age', width: 100 },
];

const rows: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 30 },
  { id: 3, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 4, name: 'Bob', email: 'bob@example.com', age: 30 },
  { id: 5, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 6, name: 'Bob', email: 'bob@example.com', age: 30 },
  { id: 7, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 8, name: 'Bob', email: 'bob@example.com', age: 30 },
  { id: 9, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 10, name: 'Bob', email: 'bob@example.com', age: 30 },
  { id: 11, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 12, name: 'Bob', email: 'bob@example.com', age: 30 },
  { id: 13, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 14, name: 'Bob', email: 'bob@example.com', age: 30 },
  { id: 15, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 16, name: 'Bob', email: 'bob@example.com', age: 30 },
  { id: 17, name: 'Alice', email: 'bob@example.com', age: 25 },
  { id: 18, name: 'Bob', email: 'bob@example.com', age: 25 },
  { id: 19, name: 'Alice', email: 'bob@example.com', age: 25 },
  { id: 20, name: 'Bob', email: 'bob@example.com', age: 25 },
  { id: 21, name: 'Alice', email: 'bob@example.com', age: 25 },
  { id: 22, name: 'Bob', email: 'bob@example.com', age: 25 },
  { id: 23, name: 'Alice', email: 'bob@example.com', age: 25 },
];

function UserTable() {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  return (
    <GenericTable
      rows={rows}
      columns={columns}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
    />
  );
}

const UsersListing = () => {
  return (
    <Box
      display="flex"
      sx={{
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 2,
      }}
      gap={1}
    >
      <Typography variant="h6" sx={{ padding: 0 }}>
        User Management Dashboard
      </Typography>
      <UserTable />
    </Box>
  );
};

export default UsersListing;

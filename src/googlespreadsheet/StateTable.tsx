import * as React from "react";
import {
  TableContainer,
  TableRow,
  TableBody,
  Table,
  TableCell,
  TableHead,
} from "@mui/material";

export function StateTable(props: { rows: Array<[string, string]> }) {
  const { rows } = props;
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>State</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            return (
              <TableRow key={index}>
                <TableCell scope="row">{row[0]}</TableCell>
                <TableCell scope="row">{row[1]}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

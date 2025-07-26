import { db } from '../connect.js'

export const getExternalMonitorProtocolList = (req, res) => {
  const que = `SELECT 
      ps.protocol_id, ps.parent_protocol_id, ps.research_type, ps.status, ps.protocol_user_type, ps.added_by, ps.created_at, ps.updated_at, 
      emp.id, emp.external_monitor_id, emp.created_at as assigned_date
    FROM 
      protocols AS ps
    LEFT JOIN 
      external_monitor_protocol as emp ON ps.protocol_id = emp.protocol_id
    WHERE 
      emp.external_monitor_id = ?`
  db.query(que, [req.user.userId], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length >= 0) {
      return res.status(200).json(data)
    }
  })
}

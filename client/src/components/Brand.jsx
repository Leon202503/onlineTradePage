import { Link } from 'react-router'

export default function Brand({ light = false }) {
  return (
    <Link className={`brand${light ? ' brand-light' : ''}`} to="/" aria-label="Northstar Supply home">
      <span className="brand-mark" aria-hidden="true">N</span>
      <span>NORTHSTAR<br />SUPPLY</span>
    </Link>
  )
}

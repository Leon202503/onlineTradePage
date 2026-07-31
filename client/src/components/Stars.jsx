import { Star } from 'lucide-react'

export default function Stars({ rating = 0, className = 'review-stars-row' }) {
  return <div className={className} aria-label={`${Number(rating).toFixed(1)} out of 5 stars`}>{[1, 2, 3, 4, 5].map(value => <Star className={value <= Math.round(rating) ? 'filled' : 'empty'} key={value} />)}</div>
}

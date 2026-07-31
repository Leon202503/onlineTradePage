import { Star, X } from 'lucide-react'
import { useState } from 'react'
import { addReview } from '../services/api.js'

export default function ReviewModal({ product, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!rating) return setMessage('Choose a rating before submitting.')
    setSubmitting(true)
    setMessage('')
    try {
      await addReview({ productId: product.id, rating, title: title.trim(), comment: comment.trim() })
      await onSubmitted()
      onClose()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="react-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="react-review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title">
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-dialog-header"><div><p className="eyebrow">Your experience</p><h2 id="review-title">Write a review</h2></div><button className="icon-button" type="button" aria-label="Close review form" onClick={onClose}><X /></button></div>
          <div className="review-product-name">{product.name}</div>
          <fieldset className="review-rating-field"><legend>Your rating</legend><div className="review-rating-input">{[1, 2, 3, 4, 5].map(value => <button className={value <= rating ? 'active' : ''} type="button" key={value} aria-label={`${value} stars`} onClick={() => setRating(value)}><Star /></button>)}</div></fieldset>
          <label className="review-field"><span>Review title</span><input value={title} maxLength="100" required onChange={event => setTitle(event.target.value)} /></label>
          <label className="review-field"><span>Your review</span><textarea value={comment} maxLength="1000" rows="6" required onChange={event => setComment(event.target.value)} /><small>{comment.length} / 1000</small></label>
          <p className="review-submit-message" role="alert">{message}</p>
          <button className="detail-add-button review-submit-button" type="submit" disabled={submitting}>{submitting ? 'Submitting review' : 'Submit review'}</button>
        </form>
      </section>
    </div>
  )
}

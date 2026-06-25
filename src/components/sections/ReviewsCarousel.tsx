import { Card } from '@/components/ui/Card'

interface Review {
  name: string
  location: string
  rating: number
  text: string
  service: string
  date: string
}

const REVIEWS: Review[] = [
  {
    name: 'Ahmed Al Mansouri',
    location: 'Dubai',
    rating: 5,
    text: 'Excellent service! My BMW 5 Series AC was fixed within 3 hours. The technician was professional and explained everything. Very fair price.',
    service: 'Car AC Repair',
    date: '2 weeks ago',
  },
  {
    name: 'Sarah Johnson',
    location: 'Abu Dhabi',
    rating: 5,
    text: 'Booked online, got a quote instantly, technician arrived on time. My Toyota Camry oil change done at home. Highly recommend!',
    service: 'Oil Change',
    date: '1 month ago',
  },
  {
    name: 'Mohammed Al Rashid',
    location: 'Sharjah',
    rating: 5,
    text: 'Used them for brake service on my Audi A4. Great communication, genuine parts, and the job was done perfectly. Will use again.',
    service: 'Brake Service',
    date: '3 weeks ago',
  },
  {
    name: 'Priya Sharma',
    location: 'Dubai',
    rating: 5,
    text: 'Amazing experience from booking to completion. Got engine diagnostic done same day. Clear report and honest advice. No unnecessary work pushed.',
    service: 'Engine Diagnostics',
    date: '1 week ago',
  },
  {
    name: 'Khalid Al Falasi',
    location: 'Ras Al Khaimah',
    rating: 5,
    text: 'Best car service in UAE. Fixed my Mercedes tyre issue in under an hour at my office parking. Great value and professional team.',
    service: 'Tyre Change',
    date: '2 months ago',
  },
  {
    name: 'Lisa Chen',
    location: 'Ajman',
    rating: 4,
    text: 'Really good service and transparent pricing. Slight wait for parts but they kept me updated throughout. Would use again.',
    service: 'Battery Replacement',
    date: '3 months ago',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <svg
          key={n}
          className={`w-4 h-4 ${n <= rating ? 'text-[#F59E0B]' : 'text-[#E5E7EB]'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export function ReviewsCarousel() {
  return (
    <section className="py-14 lg:py-20 bg-[#F9FAFB]" aria-labelledby="reviews-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 id="reviews-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-2">
            What Our Customers Say
          </h2>
          <p className="text-[#6B7280]">4.9 ★ average from 2,400+ verified reviews</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map(review => (
            <Card key={review.name} padding="md">
              <div className="flex justify-between items-start mb-3">
                <StarRating rating={review.rating} />
                <span className="text-xs text-[#9CA3AF]">{review.date}</span>
              </div>
              <blockquote className="text-sm text-[#374151] leading-relaxed mb-4">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 border-t border-[#F3F4F6] pt-3">
                <div className="w-8 h-8 rounded-full bg-[#4472C4] text-white text-sm font-bold flex items-center justify-center">
                  {review.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1F2937]">{review.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{review.location} · {review.service}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

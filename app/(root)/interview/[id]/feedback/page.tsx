import FeedbackVisualization from '@/components/FeedbackVisualization'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { getFeedbackByInterviewId, getInterviewById } from '@/lib/actions/general.action'
import { getCurrentUser } from '@/lib/actions/auth.action'

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // ✅ Await the params object

    const user = await getCurrentUser();
    if (!user?.id) return null;

    const interview = await getInterviewById(id);
    const feedback = await getFeedbackByInterviewId({
        interviewId: id,
        userId: user.id,
    });

    if (!feedback) return null;

    return (
        <section className="section-feedback">
            <div className="flex flex-col items-center gap-2 mb-8">
                <h1 className="text-4xl font-semibold text-center">Interview Feedback</h1>
                <div className="flex gap-4 items-center">
                    <Image src="/calendar.svg" width={20} height={20} alt="date" />
                    <span>{dayjs(feedback.createdAt).format('MMM D, YYYY h:mm A')}</span>
                </div>
            </div>

            <FeedbackVisualization feedback={feedback} />

            <div className="buttons mt-12">
                <Button className="btn-secondary flex-1">
                    <Link href="/">Back to Dashboard</Link>
                </Button>
                <Button className="btn-primary flex-1">
                    <Link href={`/interview/${id}`}>Retake Interview</Link>
                </Button>
            </div>
        </section>
    )
}

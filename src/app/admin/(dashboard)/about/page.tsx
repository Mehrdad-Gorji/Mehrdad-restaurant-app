'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/image-upload';
import BackToDashboard from '@/components/admin/back-to-dashboard';
import ResponsiveGrid from '@/components/admin/responsive-grid';

interface TeamMember {
    name: string;
    role: string;
    image: string;
}

export default function AboutAdminPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [about, setAbout] = useState({
        title: 'About Us',
        titleSv: 'Om Oss',
        titleDe: 'Über Uns',
        titleFa: 'درباره ما',
        content: '',
        contentSv: '',
        contentDe: '',
        contentFa: '',
        mission: '',
        missionSv: '',
        missionDe: '',
        missionFa: '',
        heroImage: '',
        teamMembers: '[]'
    });
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        fetch('/api/about')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setAbout(prev => ({
                        ...prev,
                        title: data.title || prev.title,
                        titleSv: data.titleSv || prev.titleSv,
                        titleDe: data.titleDe || prev.titleDe,
                        titleFa: data.titleFa || prev.titleFa,
                        content: data.content || '',
                        contentSv: data.contentSv || '',
                        contentDe: data.contentDe || '',
                        contentFa: data.contentFa || '',
                        mission: data.mission || '',
                        missionSv: data.missionSv || '',
                        missionDe: data.missionDe || '',
                        missionFa: data.missionFa || '',
                        heroImage: data.heroImage || '',
                        teamMembers: data.teamMembers || '[]'
                    }));
                    if (data.teamMembers) {
                        try {
                            const members = JSON.parse(data.teamMembers);
                            if (Array.isArray(members)) setTeamMembers(members);
                        } catch (e) {
                            setTeamMembers([]);
                        }
                    } else {
                        setTeamMembers([]);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAbout({ ...about, [e.target.name]: e.target.value });
    };

    const updateTeamMembers = (newMembers: TeamMember[]) => {
        setTeamMembers(newMembers);
        setAbout({ ...about, teamMembers: JSON.stringify(newMembers) });
    };

    const addTeamMember = () => {
        updateTeamMembers([...teamMembers, { name: '', role: '', image: '' }]);
    };

    const removeTeamMember = (index: number) => {
        updateTeamMembers(teamMembers.filter((_, i) => i !== index));
    };

    const updateMember = (index: number, field: keyof TeamMember, value: string) => {
        const newMembers = [...teamMembers];
        newMembers[index] = { ...newMembers[index], [field]: value };
        updateTeamMembers(newMembers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/about', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...about, teamMembers: JSON.stringify(teamMembers) })
            });
            if (res.ok) {
                // Show floating success toast simulation
                const toast = document.createElement('div');
                toast.textContent = 'About page saved successfully!';
                Object.assign(toast.style, {
                    position: 'fixed', bottom: '20px', right: '20px',
                    background: '#10b981', color: 'white', padding: '1rem 2rem',
                    borderRadius: '8px', zIndex: 9999, transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                });
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            } else {
                alert('Failed to save about page.');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving about page.');
        } finally {
            setSaving(false);
        }
    };

    const sectionStyle = {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        marginBottom: '2rem'
    };

    const headerStyle = {
        marginTop: 0,
        marginBottom: '1.5rem',
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: '1rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s',
        marginTop: '0.5rem'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500'
    };

    const textareaStyle = {
        ...inputStyle,
        minHeight: '120px',
        resize: 'vertical' as const,
        fontFamily: 'inherit'
    };

    if (loading) return <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <BackToDashboard />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem', marginTop: '1rem' }}>
                <div>
                    <h1 style={{
                        marginTop: 0,
                        marginBottom: '0.5rem',
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>ℹ️ About Page</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Manage your company's story, mission, and team.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                        opacity: saving ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span>{saving ? '💾 Saving...' : '💾 Save Changes'}</span>
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <ResponsiveGrid columns="2-1">

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Titles */}
                        <section style={sectionStyle}>
                            <h2 style={headerStyle}>📝 Page Titles</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Title (English)</label>
                                    <input type="text" name="title" value={about.title} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Title (Svenska)</label>
                                    <input type="text" name="titleSv" value={about.titleSv} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Title (Deutsch)</label>
                                    <input type="text" name="titleDe" value={about.titleDe} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>تیتر (فارسی)</label>
                                    <input type="text" name="titleFa" value={about.titleFa} onChange={handleChange} style={{ ...inputStyle, direction: 'rtl' }} />
                                </div>
                            </div>
                        </section>

                        {/* Mission Statement */}
                        <section style={sectionStyle}>
                            <h2 style={headerStyle}>🎯 Mission Statement</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Mission (English)</label>
                                    <textarea name="mission" value={about.mission} onChange={handleChange} style={textareaStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Mission (Svenska)</label>
                                    <textarea name="missionSv" value={about.missionSv} onChange={handleChange} style={textareaStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Mission (Deutsch)</label>
                                    <textarea name="missionDe" value={about.missionDe} onChange={handleChange} style={textareaStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>ماموریت (فارسی)</label>
                                    <textarea name="missionFa" value={about.missionFa} onChange={handleChange} style={{ ...textareaStyle, direction: 'rtl' }} />
                                </div>
                            </div>
                        </section>

                        {/* Main Content */}
                        <section style={sectionStyle}>
                            <h2 style={headerStyle}>📖 Main Content</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Content (English)</label>
                                    <textarea name="content" value={about.content} onChange={handleChange} style={{ ...textareaStyle, minHeight: '200px' }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Content (Svenska)</label>
                                    <textarea name="contentSv" value={about.contentSv} onChange={handleChange} style={{ ...textareaStyle, minHeight: '200px' }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Content (Deutsch)</label>
                                    <textarea name="contentDe" value={about.contentDe} onChange={handleChange} style={{ ...textareaStyle, minHeight: '200px' }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>محتوا (فارسی)</label>
                                    <textarea name="contentFa" value={about.contentFa} onChange={handleChange} style={{ ...textareaStyle, minHeight: '200px', direction: 'rtl' }} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Hero Section */}
                        <section style={sectionStyle}>
                            <h2 style={headerStyle}>🖼️ Hero Image</h2>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Upload Banner Image</label>
                                <div style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <ImageUpload
                                        value={about.heroImage || ''}
                                        onChange={(url) => setAbout({ ...about, heroImage: url })}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Team Members */}
                        <section style={sectionStyle}>
                            <h2 style={headerStyle}>👥 Team Members</h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Add your team members to display on the page.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {teamMembers.map((member, index) => (
                                    <div key={index} style={{
                                        padding: '1.5rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        position: 'relative'
                                    }}>
                                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                            <button
                                                type="button"
                                                onClick={() => removeTeamMember(index)}
                                                style={{
                                                    padding: '0.4rem',
                                                    background: 'rgba(239, 68, 68, 0.15)',
                                                    color: '#fca5a5',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ ...labelStyle, fontSize: '0.8rem', marginBottom: '0.3rem' }}>NAME</label>
                                            <input
                                                type="text"
                                                value={member.name}
                                                onChange={(e) => updateMember(index, 'name', e.target.value)}
                                                style={{ ...inputStyle, marginTop: 0, padding: '0.5rem' }}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ ...labelStyle, fontSize: '0.8rem', marginBottom: '0.3rem' }}>ROLE</label>
                                            <input
                                                type="text"
                                                value={member.role}
                                                onChange={(e) => updateMember(index, 'role', e.target.value)}
                                                style={{ ...inputStyle, marginTop: 0, padding: '0.5rem' }}
                                                placeholder="Head Chef"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ ...labelStyle, fontSize: '0.8rem', marginBottom: '0.3rem' }}>IMAGE</label>

                                            {/* Simple Image URL input for now, ideally reused ImageUpload if compatible with layout */}
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                {member.image && (
                                                    <img src={member.image} alt="Preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                                )}
                                                <input
                                                    type="text"
                                                    value={member.image}
                                                    onChange={(e) => updateMember(index, 'image', e.target.value)}
                                                    style={{ ...inputStyle, marginTop: 0, padding: '0.5rem', flex: 1 }}
                                                    placeholder="/uploads/..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addTeamMember}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: '#a5b4fc',
                                        border: '1px dashed rgba(255,255,255,0.2)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        marginTop: '0.5rem',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    <span>+</span> Add Team Member
                                </button>
                            </div>
                        </section>
                    </div>
                </ResponsiveGrid>
            </form>
        </div>
    );
}

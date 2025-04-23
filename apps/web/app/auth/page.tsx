"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import AuthForm from '../../components/auth/AuthForm';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [isSignIn, setIsSignIn] = useState(true);
  
  useEffect(() => {
    // Get the mode from the URL query parameter
    const mode = searchParams.get('mode');
    setIsSignIn(mode !== 'signup');
  }, [searchParams]);

  return (
    <MainLayout>
      <div className="py-16 px-4">
        <div className="max-w-md mx-auto">
          <AuthForm isSignIn={isSignIn} />
        </div>
      </div>
    </MainLayout>
  );
}

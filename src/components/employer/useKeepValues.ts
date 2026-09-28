"use client";

import { useTransition, type FormEvent } from "react";

/**
 * Submits a form through a useActionState action without React's automatic
 * form reset. Passing the action to <form action> clears every uncontrolled
 * field once the action returns, so a validation error ("please tick the
 * terms") wiped everything the person had typed. Dispatching from onSubmit
 * inside a transition keeps the fields as they are; the button that was
 * pressed (for example name="intent" value="draft") is still sent.
 */
export function useKeepValues(dispatch: (formData: FormData) => void) {
  const [, startTransition] = useTransition();
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter instanceof HTMLElement ? submitter : null);
    startTransition(() => dispatch(formData));
  };
}

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { submitContactForm } from '@api/endpoints/contact'
import { getApiErrorMessage } from '@api/errors'
import { Button, Input, Select } from '@components/ui'
import {
  contactFormSchema,
  contactMethods,
  type ContactFormValues,
} from '@validation/contactFormSchema'

type ContactFormProps = {
  onDone?: () => void
}

function ContactForm({ onDone }: ContactFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      method: '',
      contact: '',
    },
    mode: 'onSubmit',
  })

  const submitForm = handleSubmit(async (values) => {
    setSubmitError('')

    try {
      // Send validated values through the API layer.
      await submitContactForm(values)
      setIsSubmitted(true)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    }
  })

  const handleDone = () => {
    // Reset the form so it can be reused from a clean state.
    setIsSubmitted(false)
    reset({
      name: '',
      method: '',
      contact: '',
    })
    onDone?.()
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto flex w-full flex-col items-center px-4 py-8 text-center text-dark md:py-12">
        <h2 className="text-xl font-bold uppercase leading-[1.1] tracking-tight">
          We have received your application!
        </h2>

        <p className="mt-5 text-xl leading-[1.1] font-normal">
          We will process your request and get in touch with you
        </p>

        {/* Let the parent close a modal, if the form is rendered inside one. */}
        <Button type="button" onClick={handleDone} className="mt-12">
          Done
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        void submitForm(event)
      }}
      className="mx-auto w-full px-4 py-8 text-dark font-light md:py-12"
      noValidate
    >
      <p className="text-sm leading-tight text-dark md:text-sm">
        Fields with an asterisk (<span className="text-purple">*</span>) are mandatory
      </p>

      <div className="mt-6 space-y-3">
        <Input
          label="Your Name"
          placeholder="Your Name"
          autoComplete="name"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid gap-3 md:grid-cols-[0.95fr_1.45fr]">
          <Select
            label="Contact Method"
            placeholder="Contact Method *"
            options={contactMethods}
            {...register('method')}
            error={errors.method?.message}
          />

          <Input
            label="Your Contact"
            placeholder="Your Contact *"
            autoComplete="off"
            {...register('contact')}
            error={errors.contact?.message}
          />
        </div>

        {submitError ? (
          <p className="px-1 text-[0.75rem] leading-none text-red-600">{submitError}</p>
        ) : null}
      </div>

      <div className="mt-8 flex justify-center">
        <Button type="submit" className="min-w-[8rem]" disabled={isSubmitting}>
          Submit
        </Button>
      </div>
    </form>
  )
}

export default ContactForm
